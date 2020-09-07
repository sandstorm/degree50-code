<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Exercise\Material;
use App\Entity\Exercise\Solution;
use App\Entity\Video\Video;
use App\Entity\Video\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExercisePhaseType;
use App\Exercise\Form\VideoAnalysisType;
use App\Exercise\LiveSync\LiveSyncService;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\Repository\Exercise\ExercisePhaseRepository;
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
    private ExercisePhaseRepository $exercisePhaseRepository;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, AppRuntime $appRuntime, LiveSyncService $liveSyncService, RouterInterface $router, AutosavedSolutionRepository $autosavedSolutionRepository, VideoCodeRepository $videoCodeRepository, ExercisePhaseRepository $exercisePhaseRepository)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
        $this->liveSyncService = $liveSyncService;
        $this->router = $router;
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->videoCodeRepository = $videoCodeRepository;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
    }

    /**
     * @IsGranted("show", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/show/{id}/{team_id}", name="exercise-overview__exercise-phase--show")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function show(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        $showSolution = !!$request->get('showSolution');

        // config for the ui to render the react components
        $config = $this->getConfig($exercisePhase, $showSolution);
        $config['apiEndpoints'] = [
            'updateSolution' => $this->router->generate('exercise-overview__exercise-phase-team--update-solution', [
                'id' => $exercisePhaseTeam->getId()
            ]),
            'updateCurrentEditor' => $this->router->generate('exercise-overview__exercise-phase-team--update-current-editor', [
                'id' => $exercisePhaseTeam->getId()
            ]),
        ];

        $currentEditor = null;

        if (!$showSolution) {
            if ($exercisePhaseTeam->getCurrentEditor()) {
                $currentEditor = $exercisePhaseTeam->getCurrentEditor()->getId();
            } else {
                $currentEditor = $user->getId();
                $exercisePhaseTeam->setCurrentEditor($user);
            }

            $entityManager = $this->getDoctrine()->getManager();
            $this->eventStore->disableEventPublishingForNextFlush();

            if (!$exercisePhaseTeam->getSolution()) {
                $solution = new Solution();
                $exercisePhaseTeam->setSolution($solution);
                $entityManager->persist($solution);
            }

            $entityManager->persist($exercisePhaseTeam);
            $entityManager->flush();
        }

        $solution = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

        $template = 'ExercisePhase/Show.html.twig';
        if ($showSolution) {
            $template = 'ExercisePhase/ShowSolution.html.twig';
        }

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user));
        return $this->render($template, [
            'config' => $config,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'solution' => $solution,
            'currentEditor' => $currentEditor,
        ], $response);
    }

    private function getConfig($exercisePhase, $readOnly = false)
    {
        /* @var User $user */
        $user = $this->getUser();

        $components = $exercisePhase->getComponents();

        /* @var $exercisePhase VideoAnalysis */
        if ($exercisePhase->getVideoAnnotationsActive()) {
            array_push($components, ExercisePhase::VIDEO_ANNOTATION);
        }
        if ($exercisePhase->getVideoCodesActive()) {
            array_push($components, ExercisePhase::VIDEO_CODE);
        }
        if ($exercisePhase->getVideoCuttingActive()) {
            array_push($components, ExercisePhase::VIDEO_CUTTING);
        }

        return [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $components,
            'userId' => $user->getId(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'readOnly' => $readOnly,
            'videoCodesPool' => array_map(function (VideoCode $videoCode) {
                return [
                    'id' => $videoCode->getId(),
                    'name' => $videoCode->getName(),
                    'description' => $videoCode->getDescription(),
                    'color' => $videoCode->getColor(),
                    'userCreated' => false,
                    'videoCodes' => []
                ];
            }, $exercisePhase->getVideoCodes()->toArray()),
            'material' => array_map(function (Material $entry) {
                return [
                    'id' => $entry->getId(),
                    'name' => $entry->getName(),
                    'type' => $entry->getMimeType(),
                    'url' => $this->generateUrl('exercise-overview__material--download', ['id' => $entry->getId()])
                ];
            }, $exercisePhase->getMaterial()->toArray()),
            'videos' => array_map(function (Video $video) {
                return $video->getAsArray($this->appRuntime);
            }, $exercisePhase->getVideos()->toArray())
        ];
    }

    /**
     * @IsGranted("showSolutions", subject="exercisePhase")
     * @Route("/exercise-phase/show-solutions/{id}", name="exercise-overview__exercise-phase--show-solutions")
     */
    public function showSolutions(Request $request, ExercisePhase $exercisePhase): Response
    {
        $solutions = array_map(function (ExercisePhaseTeam $team) {
            return [
                'teamCreator' => $team->getCreator()->getUsername(),
                'teamMembers' => array_map(function (User $member) {
                    return $member->getUsername();
                }, $team->getMembers()->toArray()),
                'solution' => $team->getSolution()->getSolution(),
            ];
        }, $exercisePhase->getTeams()->toArray());

        return $this->render('ExercisePhase/ShowSolutions.html.twig', [
            'config' => $this->getConfig($exercisePhase, true),
            'solutions' => $solutions,
            'exercisePhase' => $exercisePhase,
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/new", name="exercise-overview__exercise-phase--new")
     */
    public function new(Request $request, Exercise $exercise): Response
    {
        $isGroupPhase = $request->query->get('isGroupPhase', false);

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
            'exercise' => $exercise,
            'isGroupPhase' => $isGroupPhase
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/type", name="exercise-overview__exercise-phase--set-type")
     */
    public function setType(Request $request, Exercise $exercise): Response
    {
        $type = $request->query->get('type', null);
        $isGroupPhase = $request->query->get('isGroupPhase', false);
        $exercisePhase = new ExercisePhase();
        switch ($type) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                $exercisePhase = new VideoAnalysis();
                break;
        }

        $exercisePhase->setIsGroupPhase($isGroupPhase);
        $exercisePhase->setBelongsToExercise($exercise);

        if ($type != null) {
            $existingPhaseWithHighestSorting = $this->exercisePhaseRepository->findOneBy(['belongsToExercise' => $exercise], ['sorting' => 'desc']);
            $exercisePhase->setSorting($existingPhaseWithHighestSorting ? $existingPhaseWithHighestSorting->getSorting() + 1 : 0);

            $this->eventStore->addEvent('ExercisePhaseCreated', [
                'exercisePhaseId' => $exercisePhase->getId(),
                'type' => $type
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhase);
            $entityManager->flush();

            return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'exercise' => $exercise
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/edit", name="exercise-overview__exercise-phase--edit")
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

            return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }

        return $this->render('ExercisePhase/Edit.html.twig', [
            'exercise' => $exercise,
            'exercisePhase' => $exercisePhase,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/toggle-component", name="exercise-overview__exercise-phase--toggle-component")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function toggleComponent(Request $request, Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $component = $request->query->get('component', null);
        /* @var $exercisePhase VideoAnalysis */
        switch ($component) {
            case ExercisePhase::VIDEO_ANNOTATION :
                $exercisePhase->setVideoAnnotationsActive(!$exercisePhase->getVideoAnnotationsActive());
                break;
            case ExercisePhase::VIDEO_CODE :
                $exercisePhase->setVideoCodesActive(!$exercisePhase->getVideoCodesActive());
                break;
            case ExercisePhase::VIDEO_CUTTING :
                $exercisePhase->setVideoCuttingActive(!$exercisePhase->getVideoCuttingActive());
                break;
        }

        if (!$exercisePhase->getVideoAnnotationsActive() && !$exercisePhase->getVideoCodesActive() && !$exercisePhase->getVideoCuttingActive()) {
            $this->addFlash(
                'danger',
                'Mindestens eine Komponente muss aktiv sein'
            );

            return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }


        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercisePhase);
        $entityManager->flush();

        $this->addFlash(
            'success',
            'Komponente erfolgreich aktiviert/deaktiviert'
        );

        return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/change-sorting", name="exercise-overview__exercise-phase--change-sorting")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function changeSorting(Request $request, Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $sortUp = $request->query->get('sortUp', false);
        $currentSortIndex = $exercisePhase->getSorting();

        if ($sortUp) {
            $exercisePhaseAtNewSortIndex = $this->exercisePhaseRepository->findExercisePhasesLesserThen($currentSortIndex, $exercise);
        } else {
            $exercisePhaseAtNewSortIndex = $this->exercisePhaseRepository->findExercisePhasesLargerThen($currentSortIndex, $exercise);
        }

        $exercisePhase->setSorting($exercisePhaseAtNewSortIndex->getSorting());
        $exercisePhaseAtNewSortIndex->setSorting($currentSortIndex);

        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercisePhase);
        $entityManager->persist($exercisePhaseAtNewSortIndex);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);
    }


    /**
     * @IsGranted("delete", subject="exercisePhase")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/delete", name="exercise-overview__exercise-phase--delete")
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

        return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);

    }
}
