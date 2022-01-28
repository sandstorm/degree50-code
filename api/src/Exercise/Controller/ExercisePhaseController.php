<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\Material;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCodePrototype;
use App\Entity\Exercise\Solution;
use App\Entity\Exercise\VideoCode;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\Controller\Dto\PreviousSolutionDto;
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
 * @IsGranted("terms-of-use-accepted")
 */
class ExercisePhaseController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private AppRuntime $appRuntime;
    private LiveSyncService $liveSyncService;
    private RouterInterface $router;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private LoggerInterface $logger;
    private SolutionService $solutionService;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(
        AutosavedSolutionRepository $autosavedSolutionRepository,
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        AppRuntime $appRuntime,
        LiveSyncService $liveSyncService,
        RouterInterface $router,
        ExercisePhaseRepository $exercisePhaseRepository,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        LoggerInterface $logger,
        SolutionService $solutionService
    )
    {
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->logger = $logger;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
        $this->liveSyncService = $liveSyncService;
        $this->router = $router;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->solutionService = $solutionService;
    }

    /**
     * @Security("is_granted('showSolution', exercisePhaseTeam) or is_granted('show', exercisePhaseTeam)")
     * @Route("/exercise-phase/show-others/{id}/{team_id}", name="exercise-overview__exercise-phase--show-other-solution")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function showOtherStudentsSolution(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        // config for the ui to render the react components
        $config = $this->getConfigWithSolutionApiEndpoints($exercisePhase, $exercisePhaseTeam, false);

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhase));

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder();
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $template = 'ExercisePhase/ShowSolution.html.twig';

        return $this->render($template, [
            'config' => $config,
            'data' => $clientSideSolutionDataBuilder,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercisePhase->getBelongsToExercise(),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'currentEditor' => null,
        ], $response);
    }

    /**
     * @Security("is_granted('showSolution', exercisePhaseTeam) or is_granted('show', exercisePhaseTeam)")
     * @Route("/exercise-phase/show/{id}/{team_id}", name="exercise-overview__exercise-phase--show")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function show(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        // config for the ui to render the react components
        $config = $this->getConfigWithSolutionApiEndpoints($exercisePhase, $exercisePhaseTeam, false);

        $this->initiateExercisePhaseTeamWithSolution($exercisePhaseTeam, $user);

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhase));

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder();
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $template = 'ExercisePhase/Show.html.twig';

        return $this->render($template, [
            'config' => $config,
            'data' => $clientSideSolutionDataBuilder,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercisePhase->getBelongsToExercise(),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId(),
        ], $response);
    }

    private function initiateExercisePhaseTeamWithSolution(
        ExercisePhaseTeam $exercisePhaseTeam,
        User $user
    ) {
        if (!$exercisePhaseTeam->getCurrentEditor()) {
            $exercisePhaseTeam->setCurrentEditor($user->getId());
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

    private function getConfigWithSolutionApiEndpoints(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        $readOnly = false
    ) {
        $config = $this->getConfig($exercisePhase, $readOnly);
        $config['apiEndpoints'] = [
            'updateSolution' => $this->router->generate('exercise-overview__exercise-phase-team--update-solution', [
                'id' => $exercisePhaseTeam->getId()
            ]),
            'updateCurrentEditor' => $this->router->generate('exercise-overview__exercise-phase-team--update-current-editor', [
                'id' => $exercisePhaseTeam->getId()
            ]),
        ];

        return $config;
    }

    private function getConfig(ExercisePhase $exercisePhase, $readOnly = false)
    {
        /* @var User $user */
        $user = $this->getUser();

        $components = $exercisePhase->getComponents();

        switch ($exercisePhase->getType()) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                /**
                 * @var VideoAnalysisPhase $exercisePhase
                 **/
                if ($exercisePhase->getVideoAnnotationsActive()) {
                    array_push($components, ExercisePhase::VIDEO_ANNOTATION);
                }
                if ($exercisePhase->getVideoCodesActive()) {
                    array_push($components, ExercisePhase::VIDEO_CODE);
                }

                break;
            case ExercisePhase::TYPE_VIDEO_CUTTING :
                array_push($components, ExercisePhase::VIDEO_CUTTING);
                break;
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
            'readOnly' => $readOnly,
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
        $exercisePhase = $phaseId
            ? $exercisePhase = $this->exercisePhaseRepository->find($phaseId)
            : $exercisePhase = $exercise->getPhases()->first();

        $teams = $this->exercisePhaseTeamRepository->findAllCreatedByOtherUsers($exercise->getCreator(), $exercise->getCreator(), $exercisePhase);

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder();
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilderForSolutionView(
            $clientSideSolutionDataBuilder,
            $teams
        );

        // TODO throws Parameter 'userId' does not exist.... why?
        //$this->getDoctrine()->getManager()->getFilters()->enable('video_doctrine_filter');

        return $this->render('ExercisePhase/ShowSolutions.html.twig', [
            'config' => $this->getConfig($exercisePhase, true),
            'data' => $clientSideSolutionDataBuilder,
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

        // TODO
        // Why would we ever have a list of types for a single phase?
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
    public function initializePhaseByType(Request $request, Exercise $exercise): Response
    {
        $type = $request->query->get('type', null);
        $isGroupPhase = $request->query->get('isGroupPhase', false);
        $exercisePhase = new ExercisePhase();

        // Initialize phase by type (mandatory)
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
            return $this->persistPhaseAndRedirectToEdit($exercise, $exercisePhase, $type);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'exercise' => $exercise
        ]);
    }

    private function persistPhaseAndRedirectToEdit(Exercise $exercise, ExercisePhase $exercisePhase, string $type) {
        $existingPhaseWithHighestSorting = $this
            ->exercisePhaseRepository
            ->findOneBy(['belongsToExercise' => $exercise], ['sorting' => 'desc']);

        $exercisePhase->setSorting(
            $existingPhaseWithHighestSorting
                ? $existingPhaseWithHighestSorting->getSorting() + 1
                : 0
        );

        $this->eventStore->addEvent('ExercisePhaseCreated', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'type' => $type
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercisePhase);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
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

        /**
         * @var VideoAnalysisPhase $exercisePhase
         **/
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
