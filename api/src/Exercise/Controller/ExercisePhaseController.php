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
    public function show(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        // config for the ui to render the react components
        $config = [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $exercisePhase->getComponents(),
            'userId' => $user->getId(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'apiEndpoints' => [
              'updateSolution' => $this->router->generate('app_exercise-phase-update-solution', [
                  'id' => $exercisePhase->getId(),
                  'team_id' => $exercisePhaseTeam->getId()
              ])
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

        $latestAutosavedSolution = $this->autosavedSolutionRepository->findOneBy([], ['update_timestamp' => 'desc']);
        $sharedSolution = $exercisePhaseTeam->getSolution();

        $solution = $sharedSolution->getSolution();
        if ($latestAutosavedSolution && $latestAutosavedSolution->getUpdateTimestamp() > $sharedSolution->getUpdateTimestamp()) {
            $solution = $latestAutosavedSolution->getSolution();
        }

        return $this->render('ExercisePhase/Show.html.twig', [
            'config' => $config,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'solution' => $solution
        ], $response);
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
        $latestAutosavedSolution = $this->autosavedSolutionRepository->findOneBy([], ['update_timestamp' => 'desc']);
        $solution->setSolution($latestAutosavedSolution->getSolution());
        $solution->setUpdateTimestamp($latestAutosavedSolution->getUpdateTimestamp());

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
                        'components' => $exercisePhase->getComponents()
                    ]);
            }

            // TODO expose videocodes to the ui
            $videoCodes = $this->videoCodeRepository->findAll();
            foreach ($videoCodes as $videoCode) {
                $exercisePhase->addVideoCode($videoCode);
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
     * @IsGranted("updateSolution", subject="exercisePhase")
     * @Route("/exercise-phase/update-solution/{id}/{team_id}", name="app_exercise-phase-update-solution")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function updateSolution(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $solutionFromJson = json_decode($request->getContent(), true);

        $autosaveSolution = new AutosavedSolution();
        $autosaveSolution->setTeam($exercisePhaseTeam);
        $autosaveSolution->setSolution($solutionFromJson['solution']);
        /* @var User $user */
        $user = $this->getUser();
        $autosaveSolution->setOwner($user);

        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($autosaveSolution);
        $entityManager->flush();

        // push solution to other clients
        $this->liveSyncService->publish($exercisePhaseTeam, $solutionFromJson);
        return Response::create('OK');
    }
}
