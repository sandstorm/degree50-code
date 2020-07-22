<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Exercise\Material;
use App\Entity\Video\Video;
use App\Entity\Video\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExercisePhaseType;
use App\Exercise\Form\VideoAnalysisType;
use App\Exercise\LiveSync\LiveSyncService;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\Repository\Video\VideoCodeRepository;
use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExercisePhaseController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private AppRuntime $appRuntime;
    private LiveSyncService $liveSyncService;
    private RouterInterface $router;
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private VideoCodeRepository $videoCodeRepository;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, AppRuntime $appRuntime, LiveSyncService $liveSyncService, RouterInterface $router, AutosavedSolutionRepository $autosavedSolutionRepository, VideoCodeRepository $videoCodeRepository)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
        $this->liveSyncService = $liveSyncService;
        $this->router = $router;
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->videoCodeRepository = $videoCodeRepository;
    }

    /**
     * @IsGranted("show", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/show/{id}/{team_id}", name="app_exercise-phase-show")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function show(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        $showSolution = $request->get('showSolution');

        // config for the ui to render the react components
        $config = [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $exercisePhase->getComponents(),
            'userId' => $user->getId(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'readOnly' => $showSolution,
            'apiEndpoints' => [
                'updateSolution' => $this->router->generate('app_exercise-phase-update-solution', [
                    'id' => $exercisePhase->getId(),
                    'team_id' => $exercisePhaseTeam->getId()
                ]),
                'updateCurrentEditor' => $this->router->generate('app_exercise-phase-update-current-editor', [
                    'id' => $exercisePhase->getId(),
                    'team_id' => $exercisePhaseTeam->getId()
                ]),
            ],
            'videoCodes' => array_map(function (VideoCode $videoCode) {
                return [
                    'id' => $videoCode->getId(),
                    'name' => $videoCode->getName(),
                    'description' => $videoCode->getDescription(),
                    'color' => $videoCode->getColor(),
                ];
            }, $exercisePhase->getVideoCodes()->toArray()),
            'material' => array_map(function (Material $entry) {
                return [
                    'id' => $entry->getId(),
                    'name' => $entry->getName(),
                    'type' => $entry->getMimeType(),
                    'url' => $this->generateUrl('app_material-download', ['id' => $entry->getId()])
                ];
            }, $exercisePhase->getMaterial()->toArray()),
            'videos' => array_map(function (Video $video) {
                $videoUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());
                return [
                    'id' => $video->getId(),
                    'name' => $video->getTitle(),
                    'description' => $video->getDescription(),
                    'url' => $videoUrl . '/hls.m3u8'
                ];
            }, $exercisePhase->getVideos()->toArray())
        ];

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($this->getUser()));

        $solution = $this->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

        if ($exercisePhase->isGroupPhase()) {
            // Current editor is the persisted one or current user - if there is no persisted current editor then the user is the first one to start the team phase
            $currentEditor = null;
            if ($exercisePhaseTeam->getCurrentEditor()) {
                $currentEditor = $exercisePhaseTeam->getCurrentEditor()->getId();
            } else {
                $currentEditor = $user->getId();
                $exercisePhaseTeam->setCurrentEditor($user);
                $entityManager = $this->getDoctrine()->getManager();
                $entityManager->persist($exercisePhaseTeam);
                $entityManager->flush();
            }
        }

        $template = 'ExercisePhase/Show.html.twig';
        if ($showSolution) {
            $template = 'ExercisePhase/ShowSolution.html.twig';
        }

        return $this->render($template, [
            'config' => $config,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'solution' => $solution,
            'currentEditor' => $exercisePhase->isGroupPhase() ? $currentEditor : null,
        ], $response);
    }

    private function getLatestSolutionOfExerciseTeam(ExercisePhaseTeam $exercisePhaseTeam)
    {
        $latestAutosavedSolution = $this->autosavedSolutionRepository->findOneBy(['team' => $exercisePhaseTeam], ['update_timestamp' => 'desc']);
        $solution = $exercisePhaseTeam->getSolution()->getSolution();
        $latestSolutionUpdate = $exercisePhaseTeam->getSolution()->getUpdateTimestamp();

        if ($latestAutosavedSolution && $latestAutosavedSolution->getUpdateTimestamp() > $latestSolutionUpdate) {
            $solution = $latestAutosavedSolution->getSolution();
        }

        return $solution;
    }

    /**
     * @Route("/exercise-phase/share-result/{id}/{team_id}", name="app_exercise-phase-share-result")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function shareResult(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $entityManager = $this->getDoctrine()->getManager();

        $solution = $exercisePhaseTeam->getSolution();
        $solution->setTeam($exercisePhaseTeam);

        // use solution of the latest autosaved one
        $latestAutosavedSolution = $this->autosavedSolutionRepository->findOneBy(['team' => $exercisePhaseTeam], ['update_timestamp' => 'desc']);
        if ($latestAutosavedSolution) {
            $solution->setSolution($latestAutosavedSolution->getSolution());
            $solution->setUpdateTimestamp($latestAutosavedSolution->getUpdateTimestamp());
        }

        // remove autosaved solutions
        $autosavedSolutions = $exercisePhaseTeam->getAutosavedSolutions();
        foreach ($autosavedSolutions as $autosavedSolution) {
            $entityManager->remove($autosavedSolution);
        }

        $this->eventStore->addEvent('SolutionShared', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'solutionId' => $solution->getId()
        ]);

        $entityManager->persist($solution);
        $entityManager->flush();

        return $this->redirectToRoute('app_exercise', ['id' => $exercisePhase->getBelongsToExcercise()->getId(), 'phase' => $exercisePhase->getSorting()]);
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/new", name="app_exercise-phase-new")
     */
    public function new(Request $request, Exercise $exercise): Response
    {
        $types = [];
        foreach (ExercisePhase::PHASE_TYPES as $type) {
            array_push($types, [
                'id' => $type,
                'iconClass' => $this->translator->trans('exercisePhase.types.' . $type . '.iconClass', [], 'forms'),
                'label' => $this->translator->trans('exercisePhase.types.' . $type . '.label', [], 'forms')
            ]);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'types' => $types,
            'exercise' => $exercise
        ]);
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/type", name="app_exercise-phase-new-set-type")
     */
    public function setType(Request $request, Exercise $exercise): Response
    {
        $type = $request->query->get('type', null);
        $exercisePhase = new ExercisePhase();
        switch ($type) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                $exercisePhase = new VideoAnalysis();
                break;
        }

        $exercisePhase->setBelongsToExcercise($exercise);

        if ($type != null) {
            $exercisePhase->setSorting(count($exercise->getPhases()));

            $this->eventStore->addEvent('ExercisePhaseCreated', [
                'exercisePhaseId' => $exercisePhase->getId(),
                'type' => $type
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhase);
            $entityManager->flush();

            return $this->redirectToRoute('app_exercise-phase-edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'exercise' => $exercise
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/edit", name="app_exercise-phase-edit")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function edit(Request $request, Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $form = $this->createForm(ExercisePhaseType::class, $exercisePhase);
        switch ($exercisePhase->getType()) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                $form = $this->createForm(VideoAnalysisType::class, $exercisePhase);
                break;
        }

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $exercisePhase = $form->getData();

            switch ($exercisePhase->getType()) {

                case ExercisePhase::TYPE_VIDEO_ANALYSE :
                    /* @var $exercisePhase VideoAnalysis */
                    $this->eventStore->addEvent('VideoAnalyseExercisePhaseEdited', [
                        'exercisePhaseId' => $exercisePhase->getId(),
                        'name' => $exercisePhase->getName(),
                        'task' => $exercisePhase->getTask(),
                        'isGroupPhase' => $exercisePhase->isGroupPhase(),
                        'material' => $exercisePhase->getMaterial()->map(fn(Material $material) => [
                            'materialId' => $material->getId(),
                            'name' => $material->getName()
                        ])->toArray(),
                        'videos' => $exercisePhase->getVideos()->map(fn(Video $video) => [
                            'videoId' => $video->getId()
                        ])->toArray(),
                        'videoCodes' => $exercisePhase->getVideoCodes()->map(fn(VideoCode $videoCode) => [
                            'videoCodeId' => $videoCode->getId()
                        ])->toArray(),
                        'components' => $exercisePhase->getComponents()
                    ]);
            }

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhase);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhase.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('app_exercise-phase-edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }

        return $this->render('ExercisePhase/Edit.html.twig', [
            'exercise' => $exercise,
            'exercisePhase' => $exercisePhase,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("delete", subject="exercisePhase")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/delete", name="app_exercise-phase-delete")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function delete(Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $this->eventStore->addEvent('ExercisePhaseDeleted', [
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($exercisePhase);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhase.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('app_exercise-edit', ['id' => $exercise->getId()]);

    }

    /**
     * Try to create a new AutosaveSolution and then publish the most recent version of the solution.
     *
     * @IsGranted("updateSolution", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/update-solution/{id}/{team_id}", name="app_exercise-phase-update-solution")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function updateSolution(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();
        $response = null;
        $solutionFromJson = json_decode($request->getContent(), true);

        // If current user is not current editor && there is a solution -> discard
        if ($user === $exercisePhaseTeam->getCurrentEditor()) {
            $autosaveSolution = new AutosavedSolution();
            $autosaveSolution->setTeam($exercisePhaseTeam);
            $autosaveSolution->setSolution($solutionFromJson['solution']);
            $autosaveSolution->setOwner($user);

            $this->eventStore->disableEventPublishingForNextFlush();
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($autosaveSolution);
            $entityManager->flush();

            $response = Response::create('OK');
        } else {
            $response = Response::create('Not editor!', Response::HTTP_FORBIDDEN);
        }

        // Why: send solution even if the user was not allowed to
        // This will reset the state in the client to the actual state

        $solution = $this->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

        // push solution to clients
        $this->liveSyncService->publish($exercisePhaseTeam, ['solution' => $solution, 'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId()]);

        return $response;
    }

    /**
     * Try to update the currentEditor of the TeamPhase and then publish the most recent solution
     *
     * @IsGranted("updateSolution", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/update-current-editor/{id}/{team_id}", name="app_exercise-phase-update-current-editor")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function updateCurrentEditor(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $user = $this->getUser();
        // get teamMember with the candidate id
        $currentEditorCandidateIdFromJson = json_decode($request->getContent(), true)['currentEditorCandidateId'];
        $currentEditorCandidate = $exercisePhaseTeam->getMembers()->filter(function (User $member) use ($currentEditorCandidateIdFromJson) {
            return $member->getId() === $currentEditorCandidateIdFromJson;
        })->first();

        if ($currentEditorCandidate) {
            $isAlreadySet = $currentEditorCandidate === $exercisePhaseTeam->getCurrentEditor();
            $userIsCandidate = $currentEditorCandidate === $user;
            $userIsCurrentEditor = $user === $exercisePhaseTeam->getCurrentEditor();

            // let only future currentEditor make the change
            if (!$isAlreadySet && ($userIsCandidate || $userIsCurrentEditor)) {
                $exercisePhaseTeam->setCurrentEditor($currentEditorCandidate);
                // Why: We do not need the event info about the currentEditor
                $this->eventStore->disableEventPublishingForNextFlush();
                $entityManager = $this->getDoctrine()->getManager();
                $entityManager->persist($exercisePhaseTeam);
                $entityManager->flush();

                $solution = $this->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

                // push new state to clients
                $this->liveSyncService->publish($exercisePhaseTeam, ['solution' => $solution, 'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId()]);
                return Response::create('OK');
            } else {
                return Response::create('Not updated!', Response::HTTP_NOT_MODIFIED);
            }
        } else {
            return Response::create('currentEditor candidate is not member of exercisePhaseTeam!', Response::HTTP_FORBIDDEN);
        }
    }
}
