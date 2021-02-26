<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\Material;
use App\Entity\Exercise\Solution;
use App\Entity\Exercise\VideoCode;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\SolutionService;
use App\Exercise\Form\ExercisePhaseType;
use App\Exercise\Form\VideoAnalysisType;
use App\Exercise\Form\VideoCutType;
use App\Exercise\LiveSync\LiveSyncService;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\VideoCodeRepository;
use App\Twig\AppRuntime;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
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
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private LoggerInterface $logger;
    private SolutionService $solutionService;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        AppRuntime $appRuntime,
        LiveSyncService $liveSyncService,
        RouterInterface $router,
        AutosavedSolutionRepository $autosavedSolutionRepository,
        VideoCodeRepository $videoCodeRepository,
        ExercisePhaseRepository $exercisePhaseRepository,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        LoggerInterface $logger,
        SolutionService $solutionService
    )
    {
        $this->logger = $logger;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
        $this->liveSyncService = $liveSyncService;
        $this->router = $router;
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->videoCodeRepository = $videoCodeRepository;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->solutionService = $solutionService;
    }

    /**
     * @Security("is_granted('showSolution', exercisePhaseTeam) or is_granted('show', exercisePhaseTeam)")
     * @Route("/exercise-phase/show/{id}/{team_id}", name="exercise-overview__exercise-phase--show")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function show(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        // TODO refactor this method!

        /* @var User $user */
        $user = $this->getUser();

        // FIXME what does 'showSolution' mean? Why do we need this?
        $showSolution = !!$request->get('showSolution');

        // config for the ui to render the react components
        $config = $this->getConfig($exercisePhase, $exercisePhaseTeam, $showSolution);
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
            // FIXME add why comment please

            if ($exercisePhaseTeam->getCurrentEditor()) {
                $currentEditor = $exercisePhaseTeam->getCurrentEditor()->getId();
            } else {
                $currentEditor = $user->getId();
                $exercisePhaseTeam->setCurrentEditor($user);
            }

            $entityManager = $this->getDoctrine()->getManager();
            $this->eventStore->disableEventPublishingForNextFlush();

            if (!$exercisePhaseTeam->getSolution()) {
                $newSolution = new Solution();
                $exercisePhaseTeam->setSolution($newSolution);
                $entityManager->persist($newSolution);
            }

            $entityManager->persist($exercisePhaseTeam);
            $entityManager->flush();
        }

        // TODO maybe we should use separate endpoints here instead?
        // to me it feels like this controller method does too much...
        $template = 'ExercisePhase/Show.html.twig';
        if ($showSolution) {
            $template = 'ExercisePhase/ShowSolution.html.twig';
        }

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhase));

        $solution = $this->solutionService->getSolutionFromExercisePhaseTeam($exercisePhaseTeam);

        return $this->render($template, [
            'config' => $config,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercisePhase->getBelongsToExercise(),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'solution' => $solution,
            'currentEditor' => $currentEditor,
        ], $response);
    }

    private function getConfig(ExercisePhase $exercisePhase, ExercisePhaseTeam  $exercisePhaseTeam = null, $readOnly = false)
    {
        /* @var User $user */
        $user = $this->getUser();

        $components = $exercisePhase->getComponents();
        $videoCodesPool = [];

        switch ($exercisePhase->getType()) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                /* @var $exercisePhase VideoAnalysisPhase */
                if ($exercisePhase->getVideoAnnotationsActive()) {
                    array_push($components, ExercisePhase::VIDEO_ANNOTATION);
                }
                if ($exercisePhase->getVideoCodesActive()) {
                    array_push($components, ExercisePhase::VIDEO_CODE);
                }

                $videoCodesPool = array_map(function (VideoCode $videoCode) {
                    return [
                        'id' => $videoCode->getId(),
                        'name' => $videoCode->getName(),
                        'description' => $videoCode->getDescription(),
                        'color' => $videoCode->getColor(),
                        'userCreated' => false,
                        'videoCodes' => []
                    ];
                }, $exercisePhase->getVideoCodes()->toArray());

                break;
            case ExercisePhase::TYPE_VIDEO_CUTTING :
                array_push($components, ExercisePhase::VIDEO_CUTTING);
                break;
        }

        $previousSolutions = [];
        // Get the relevant solutions of the previous phase,
        // meaning we get the solutions of each of the members of the current team
        if ($exercisePhase->getDependsOnPreviousPhase() && $exercisePhaseTeam != null) {
            $previousPhase = $this->exercisePhaseRepository->findOneBy(['sorting' => $exercisePhase->getSorting() - 1, 'belongsToExercise' => $exercisePhase->getBelongsToExercise()]);
            if ($previousPhase) {
                $previousSolutions = array_map(function (User $teamMember) use ($previousPhase) {
                    $teamOfPreviousPhase = $this->exercisePhaseTeamRepository->findByMember($teamMember, $previousPhase);
                    $solution = $teamOfPreviousPhase ? $teamOfPreviousPhase->getSolution() : null;

                    if (empty($solution)) {
                        return [];
                    }

                    return [
                        'userId' => $teamMember->getId(),
                        'userName' => $teamMember->getEmail(),
                        'solution' => $solution->getSolution(),
                        'id' => $solution->getId(),
                    ];
                }, $exercisePhaseTeam->getMembers()->toArray());
            }
        }

        return [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $components,
            'userId' => $user->getId(),
            'userName' => $user->getEmail(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'dependsOnPreviousPhase' => $exercisePhase->getDependsOnPreviousPhase(),
            'previousSolutions' => $previousSolutions,
            'readOnly' => $readOnly,
            'videoCodesPool' => $videoCodesPool,
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
     * @IsGranted("showSolution", subject="exercise")
     * @Route("/exercise-phase/show-solutions/{id}/{phase_id?}", name="exercise-overview__exercise-phase--show-solutions")
     */
    public function showSolutions(Request $request, Exercise $exercise): Response
    {
        $phaseId = $request->get('phase_id', null);
        if (!$phaseId) {
            $exercisePhase = $exercise->getPhases()->first();
        } else {
            $exercisePhase = $this->exercisePhaseRepository->find($phaseId);
        }

        $teams = $this->exercisePhaseTeamRepository->findAllCreatedByOtherUsers($exercise->getCreator(), $exercise->getCreator(), $exercisePhase);

        $this->getDoctrine()->getManager()->getFilters()->disable('video_doctrine_filter');

        $solutions = array_map(function (ExercisePhaseTeam $team) use ($exercise) {
            $solution = $team->getSolution();
            $solutionCreator = $team->getCreator();

            return [
                'teamCreator' => $team->getCreator()->getUsername(),
                'teamMembers' => array_map(function (User $member) {
                    return $member->getUsername();
                }, $team->getMembers()->toArray()),
                'solution' => $solution->getSolution(),
                'id' => $solution->getId(),
                'userName' => $solutionCreator->getUsername(),
                'userId' => $solutionCreator->getId(),
                'cutVideo' => $team->getSolution()->getCutVideo() ? $team->getSolution()->getCutVideo()->getAsArray($this->appRuntime) : null
            ];
        }, $teams);

        // TODO throws Parameter 'userId' does not exist.... why?
        //$this->getDoctrine()->getManager()->getFilters()->enable('video_doctrine_filter');

        return $this->render('ExercisePhase/ShowSolutions.html.twig', [
            'config' => $this->getConfig($exercisePhase, null, true),
            'solutions' => $solutions,
            'exercise' => $exercise,
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
                $exercisePhase = new VideoAnalysisPhase();
                break;
            case ExercisePhase::TYPE_VIDEO_CUTTING :
                $exercisePhase = new VideoCutPhase();
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
        $form = $this->getPhaseForm($exercisePhase);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            return $this->handlePhaseEditFormSubmit($form, $exercise);
        }

        return $this->render('ExercisePhase/Edit.html.twig', [
            'exercise' => $exercise,
            'exercisePhase' => $exercisePhase,
            'form' => $form->createView(),
        ]);
    }

    private function handlePhaseEditFormSubmit(FormInterface $form, Exercise $exercise) {
        $exercisePhase = $form->getData();

        /* @var $exercisePhase VideoAnalysisPhase */
        $this->eventStore->addEvent('VideoAnalyseExercisePhaseEdited', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'name' => $exercisePhase->getName(),
            'task' => $exercisePhase->getTask(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'dependsOnPreviousPhase' => $exercisePhase->getDependsOnPreviousPhase(),
            'videos' => $exercisePhase->getVideos()->map(fn(Video $video) => [
                'videoId' => $video->getId()
            ])->toArray(),
            'videoCodes' => $exercisePhase->getVideoCodes()->map(fn(VideoCode $videoCode) => [
                'videoCodeId' => $videoCode->getId()
            ])->toArray(),
            'components' => $exercisePhase->getComponents()
        ]);

        if ($this->hasInvalidPreviousPhase($exercisePhase)) {
            $this->addFlash(
                'danger',
                'Verknüpfung von Phasen aktuell nur möglich wenn die vorherige Phase vom Typ "Video-Analyse" ist.'
            );

            return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        } else if ($this->hasNoActiveComponent($exercisePhase)) {
            $this->addFlash(
                'danger',
                'Mindestens eine Komponente muss aktiv sein'
            );

            return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        } else {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhase);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhase.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }
    }

    private function hasNoActiveComponent(ExercisePhase $exercisePhase) {
        $isVideoAnalysis = $exercisePhase->getType() == ExercisePhase::TYPE_VIDEO_ANALYSE;

        if (!$isVideoAnalysis) {
            return false;
        }

        return !$exercisePhase->getVideoAnnotationsActive() && !$exercisePhase->getVideoCodesActive();
    }

    private function hasInvalidPreviousPhase(ExercisePhase $exercisePhase) {
        $dependsOnPreviousPhase= $exercisePhase->getDependsOnPreviousPhase();
        $previousPhase = $this->exercisePhaseRepository->findOneBy(['sorting' => $exercisePhase->getSorting() - 1, 'belongsToExercise' => $exercisePhase->getBelongsToExercise()]);
        $hasNoPreviousPhase = empty($previousPhase);
        $previousPhaseIsInvalid = $previousPhase && $previousPhase->getType() !== ExercisePhase::TYPE_VIDEO_ANALYSE;

        return $dependsOnPreviousPhase && ($hasNoPreviousPhase || $previousPhaseIsInvalid);
    }

    private function getPhaseForm(ExercisePhase $exercisePhase) {
        $this->createForm(ExercisePhaseType::class, $exercisePhase);
        switch ($exercisePhase->getType()) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                return $this->createForm(VideoAnalysisType::class, $exercisePhase);
            case ExercisePhase::TYPE_VIDEO_CUTTING :
                return $this->createForm(VideoCutType::class, $exercisePhase);
        }
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
        // reset the depending status to false just to avoid strange behavior -> user hast to set it anew
        $exercisePhase->setDependsOnPreviousPhase(false);
        $exercisePhaseAtNewSortIndex->setDependsOnPreviousPhase(false);

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

        // Update sortings
        $remainingPhases = $this->exercisePhaseRepository->findAllSortedBySorting($exercise);

        foreach($remainingPhases as $index => $phase) {
            $this->eventStore->addEvent('VideoAnalyseExercisePhaseEdited', [
                'exercisePhaseId' => $phase->getId(),
                'name' => $phase->getName(),
                'task' => $phase->getTask(),
                'isGroupPhase' => $phase->isGroupPhase(),
                'dependsOnPreviousPhase' => $phase->getDependsOnPreviousPhase(),
                'videos' => $phase->getVideos()->map(fn(Video $video) => [
                    'videoId' => $video->getId()
                ])->toArray(),
                'videoCodes' => $phase->getVideoCodes()->map(fn(VideoCode $videoCode) => [
                    'videoCodeId' => $videoCode->getId()
                ])->toArray(),
                'components' => $phase->getComponents()
            ]);

            /* @var $phase ExercisePhase */
            $phase->setSorting($index);
            $entityManager->persist($phase);
            $entityManager->flush();
        }

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhase.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);

    }
}
