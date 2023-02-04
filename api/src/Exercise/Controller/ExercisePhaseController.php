<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Attachment;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\MaterialPhase;
use App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\Solution;
use App\Entity\Exercise\VideoCode;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\Form\MaterialPhaseFormType;
use App\Exercise\Form\ReflexionPhaseFormType;
use App\Exercise\Form\VideoAnalysisPhaseFormFormType;
use App\Exercise\Form\VideoCutPhaseFormFormType;
use App\Exercise\LiveSync\LiveSyncService;
use App\Mediathek\Service\VideoFavouritesService;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\SolutionRepository;
use App\Twig\AppRuntime;
use Exception;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
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
    private ExercisePhaseService $exercisePhaseService;
    private ExerciseService $exerciseService;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private LoggerInterface $logger;
    private SolutionService $solutionService;
    private SolutionRepository $solutionRepository;
    private VideoFavouritesService $videoFavouritesService;

    public function __construct(
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        AppRuntime $appRuntime,
        LiveSyncService $liveSyncService,
        RouterInterface $router,
        ExercisePhaseRepository $exercisePhaseRepository,
        ExercisePhaseService $exercisePhaseService,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        LoggerInterface $logger,
        SolutionService $solutionService,
        SolutionRepository $solutionRepository,
        VideoFavouritesService $videoFavouritesService,
        ExerciseService $exerciseService,
    ) {
        $this->logger = $logger;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
        $this->liveSyncService = $liveSyncService;
        $this->router = $router;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->solutionService = $solutionService;
        $this->solutionRepository = $solutionRepository;
        $this->videoFavouritesService = $videoFavouritesService;
        $this->exerciseService = $exerciseService;
    }

    /**
     * @Security("is_granted('showSolution', exercisePhaseTeam) or is_granted('show', exercisePhaseTeam)")
     * @Route("/exercise-phase/show-others/{id}/{team_id}", name="exercise-overview__exercise-phase--show-other-solution")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function showOtherStudentsSolution(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        // config for the ui to render the react components
        $config = $this->getConfigWithSolutionApiEndpoints($exercisePhase, $exercisePhaseTeam);

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhase));

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $template = 'ExercisePhase/ShowSolution.html.twig';
        $exercise = $exercisePhase->getBelongsToExercise();

        return $this->render($template, [
            'config' => $config,
            'data' => $clientSideSolutionDataBuilder,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercise,
            'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
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
    ): Response {
        $this->exercisePhaseService->openPhase($exercisePhaseTeam);

        if ($exercisePhase->getType() === ExercisePhaseType::REFLEXION) {
            return $this->reflectInPhase($exercisePhase, $exercisePhaseTeam);
        } else {
            return $this->workOnPhase($exercisePhase, $exercisePhaseTeam);
        }
    }

    private function reflectInPhase(
        ExercisePhase $reflexionPhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response {
        $phaseReflexionDependsOn = $reflexionPhase->getDependsOnExercisePhase();
        $exercise = $reflexionPhase->getBelongsToExercise();
        $teams = $this->exercisePhaseTeamRepository->findAllCreatedByOtherUsers($exercise->getCreator(), $exercise->getCreator(), $phaseReflexionDependsOn);

        // HOTFIX: It's possible to create a team without solutions right now, e.g. when a user creates a team in a
        // group phase and does not start the phase for this group at least once.
        // This leads to an 500 Error down the line, when the cut video of the solution is accessed. (can't get a
        // cut video from a solution that does not exist).
        // This is a quick fix and should be addressed with more insight later.
        $teams = array_filter($teams, fn ($team) => $team->getSolution() !== null);

        // Fix "Aufgabe Testen"
        $user = $this->getUser();
        if ($user === $exercise->getCreator()) {
            /* @var ExercisePhaseTeam|null $teamOfCreator */
            $teamOfCreator = $phaseReflexionDependsOn->getTeams()->filter(fn (ExercisePhaseTeam $team) => $team->getCreator() === $user)->first();

            if ($teamOfCreator && $teamOfCreator->getSolution() !== null) {
                $teams[] = $teamOfCreator;
            }
        }

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilderForSolutionView(
            $clientSideSolutionDataBuilder,
            $teams
        );

        $template = 'ExercisePhase/Show.html.twig';

        $configOfDependingPhase = $this->getConfig($phaseReflexionDependsOn);

        return $this->render($template, [
            'config' => array_merge($this->getConfig($reflexionPhase), [
                'type' => $configOfDependingPhase['type'],
                'videos' => $configOfDependingPhase['videos'],
            ]),
            'data' => $clientSideSolutionDataBuilder,
            'exercise' => $exercise,
            'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'exercisePhase' => $reflexionPhase,
        ]);
    }

    private function workOnPhase(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        // config for the ui to render the react components
        $config = $this->getConfigWithSolutionApiEndpoints($exercisePhase, $exercisePhaseTeam);

        $this->initiateExercisePhaseTeamWithSolution($exercisePhase, $exercisePhaseTeam, $user);

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhase));

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $template = 'ExercisePhase/Show.html.twig';
        $exercise = $exercisePhase->getBelongsToExercise();

        return $this->render($template, [
            'config' => $config,
            'data' => $clientSideSolutionDataBuilder,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercise,
            'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId(),
        ], $response);
    }

    /**
     * FIXME: It is possible that there are Exercises with no Phases! This currently just throws a 500 Error, but shouldn't!
     *
     * @IsGranted("showSolution", subject="exercise")
     * @Route("/exercise-phase/show-solutions/{id}/{phase_id?}", name="exercise-overview__exercise-phase--show-solutions")
     */
    public function showSolutions(Request $request, Exercise $exercise): Response
    {
        $phaseId = $request->get('phase_id');
        /**
         * @var ExercisePhase $exercisePhase
         */
        $exercisePhase = $phaseId
            ? $this->exercisePhaseRepository->find($phaseId)
            : $exercise->getPhases()->first();

        // TODO: is this correct? user = exercise creator?
        $teams = $this->exercisePhaseTeamRepository->findAllCreatedByOtherUsers($exercise->getCreator(), $exercise->getCreator(), $exercisePhase);

        // HOTFIX: It's possible to create a team without solutions right now, e.g. when a user creates a team in a
        // group phase and does not start the phase for this group at least once.
        // This leads to an 500 Error down the line, when the cut video of the solution is accessed. (can't get a
        // cut video from a solution that does not exist).
        // This is a quick fix and should be addressed with more insight later.
        $teams = array_filter($teams, fn ($team) => $team->getSolution() !== null);

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $data = $exercisePhase->getType() === ExercisePhaseType::REFLEXION
            ? null
            : $this->solutionService->retrieveAndAddDataToClientSideDataBuilderForSolutionView(
                $clientSideSolutionDataBuilder,
                $teams
            );

        // TODO throws Parameter 'userId' does not exist.... why?
        //$this->getDoctrine()->getManager()->getFilters()->enable('video_doctrine_filter');

        // TODO: obsolete/unused?
        $phasesWithReviewRequiredIds = $exercise->getPhases()->filter(
            fn (ExercisePhase $phase) => $this->exercisePhaseService->phaseHasAtLeastOneSolutionToReview($phase)
        )->map(fn (ExercisePhase $phase) => $phase->getId());

        $user = $this->getUser();
        $phases = $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user);

        return $this->render('ExercisePhase/ShowSolutions.html.twig', [
            'config' => $this->getConfig($exercisePhase, true),
            'data' => $data,
            'exercise' => $exercise,
            'phases' => $phases,
            'currentExercisePhase' => $exercisePhase,
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/new", name="exercise-overview__exercise-phase--new")
     */
    public function new(Request $request, Exercise $exercise): Response
    {
        $types = [];

        foreach (ExercisePhaseType::getPossibleValues() as $type) {
            array_push($types, [
                'id' => $type,
                'iconClass' => $this->translator->trans('exercisePhase.types.' . $type . '.iconClass', [], 'forms'),
                'label' => $this->translator->trans('exercisePhase.types.' . $type . '.label', [], 'forms')
            ]);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'types' => $types,
            'exercise' => $exercise,
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/type", name="exercise-overview__exercise-phase--set-type")
     */
    public function initializePhaseByType(Request $request, Exercise $exercise): Response
    {
        $type = $request->query->get('type');

        // Initialize phase by type (mandatory)
        $exercisePhase = match (ExercisePhaseType::tryFrom($type)) {
            ExercisePhaseType::VIDEO_ANALYSIS => new VideoAnalysisPhase(),
            ExercisePhaseType::VIDEO_CUT => new VideoCutPhase(),
            ExercisePhaseType::REFLEXION => new ReflexionPhase(),
            ExercisePhaseType::MATERIAL => new MaterialPhase(),
            default => throw new \InvalidArgumentException(
                "ExercisePhaseType has to be one of ["
                    . implode(', ', ExercisePhaseType::getPossibleValues()) .
                    "]! '$type' given."
            ),
        };

        $exercisePhase->setBelongsToExercise($exercise);

        if ($type != null) {
            return $this->persistPhaseAndRedirectToEdit($exercise, $exercisePhase, $type);
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

    /**
     * @IsGranted("reviewSolution", subject="solution")
     * @Route("/exercise-phase-solution/finish-review/{id}", name="exercise__show-solutions--finish-review", methods={"POST"})
     */
    public function finishReview(Request $request, Solution $solution): Response
    {
        try {
            $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findBySolution($solution);
            $this->exercisePhaseService->finishReview($exercisePhaseTeam);

            return new Response('Successfully finished review', 200);
        } catch (Exception $error) {
            return new Response($error, 500);
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

        if ($exercisePhaseAtNewSortIndex === $exercisePhase->getDependsOnExercisePhase()) {
            // NOTE:
            // Technically this case should never occur, because we check this condition inside the
            // Twig template as well and disable the sort button, if it is true
            throw new Exception("A phase can't be sorted before the phase it depends on!");
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

        // Update sorting
        /** @var ExercisePhase[] $remainingPhases */
        $remainingPhases = $this->exercisePhaseRepository->findAllSortedBySorting($exercise);

        foreach ($remainingPhases as $index => $phase) {
            $this->addExercisePhaseEditedEvent($phase);

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

    private function initiateExercisePhaseTeamWithSolution(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        User $user
    ) {
        if (!$exercisePhaseTeam->getCurrentEditor()) {
            $exercisePhaseTeam->setCurrentEditor($user);
        }

        $entityManager = $this->getDoctrine()->getManager();
        $this->eventStore->disableEventPublishingForNextFlush();

        if (!$exercisePhaseTeam->getSolution()) {
            $this->initNewSolution($exercisePhase, $exercisePhaseTeam);
        }

        $entityManager->persist($exercisePhaseTeam);
        $entityManager->flush();
    }

    private function initNewSolution(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam)
    {
        $entityManager = $this->getDoctrine()->getManager();
        $this->eventStore->disableEventPublishingForNextFlush();

        $newSolution = null;

        // NOTE:
        // It would be preferable to use a match expression here.
        // However we would then not be able to use the @var comment with the type
        // assertion...
        if ($exercisePhase->getType() == ExercisePhaseType::MATERIAL) {
            /**
             * @var MaterialPhase $exercisePhase
             **/
            $newSolution = new Solution(
                null,
                $exercisePhase->getMaterial()
            );
        } else {
            $newSolution = new Solution();
        }

        $exercisePhaseTeam->setSolution($newSolution);

        $entityManager->persist($newSolution);
    }

    private function getConfigWithSolutionApiEndpoints(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        ?bool $readOnly = false
    ): array {
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

    private function getConfig(ExercisePhase $exercisePhase, $readOnly = false): array
    {
        /** @var User $user */
        $user = $this->getUser();

        $components = $exercisePhase->getComponents();

        switch ($exercisePhase->getType()) {
            case ExercisePhaseType::VIDEO_ANALYSIS:
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
            case ExercisePhaseType::VIDEO_CUT:
                array_push($components, ExercisePhase::VIDEO_CUTTING);
                break;
            case ExercisePhaseType::REFLEXION:
                break;
        }

        $dependsOnPreviousPhase = $exercisePhase->getDependsOnExercisePhase() !== null;

        return [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $components,
            'userId' => $user->getId(),
            'userName' => $user->getEmail(),
            'isStudent' => $user->isStudent(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'dependsOnPreviousPhase' => $dependsOnPreviousPhase,
            'readOnly' => $readOnly,
            'attachments' => array_map(function (Attachment $entry) {
                return [
                    'id' => $entry->getId(),
                    'name' => $entry->getName(),
                    'type' => $entry->getMimeType(),
                    'url' => $this->generateUrl('exercise-overview__attachment--download', ['id' => $entry->getId()])
                ];
            }, $exercisePhase->getAttachment()->toArray()),
            'videos' => array_map(function (Video $video) use ($user) {
                return array_merge($video->getAsClientSideVideo($this->appRuntime)->toArray(), [
                    'isFavorite' => $this->videoFavouritesService->videoIsFavorite($video, $user)
                ]);
            }, $exercisePhase->getVideos()->toArray()),
        ];
    }

    private function persistPhaseAndRedirectToEdit(Exercise $exercise, ExercisePhase $exercisePhase, string $type): RedirectResponse
    {
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

    private function handlePhaseEditFormSubmit(FormInterface $form, Exercise $exercise): RedirectResponse
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $form->getData();

        $this->addExercisePhaseEditedEvent($exercisePhase);

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
        }

        return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
    }

    private function hasNoActiveComponent(ExercisePhase $exercisePhase): bool
    {
        $isVideoAnalysis = $exercisePhase->getType() == ExercisePhaseType::VIDEO_ANALYSIS;

        if (!$isVideoAnalysis) {
            return false;
        }

        /**
         * @var VideoAnalysisPhase $exercisePhase
         **/
        return !$exercisePhase->getVideoAnnotationsActive() && !$exercisePhase->getVideoCodesActive();
    }

    /**
     * TODO: rather check for 'hasValidPreviousPhase'
     * @deprecated
     */
    private function hasInvalidPreviousPhase(ExercisePhase $exercisePhase): bool
    {
        $exercisePhaseDependedOn = $exercisePhase->getDependsOnExercisePhase();

        if ($exercisePhaseDependedOn == null) {
            return false;
        }

        return !$this->exercisePhaseService->isValidDependingOnExerciseCombination($exercisePhaseDependedOn, $exercisePhase);
    }

    private function getPhaseForm(ExercisePhase $exercisePhase): FormInterface
    {
        return match ($exercisePhase->getType()) {
            ExercisePhaseType::VIDEO_ANALYSIS => $this->createForm(VideoAnalysisPhaseFormFormType::class, $exercisePhase),
            ExercisePhaseType::VIDEO_CUT => $this->createForm(VideoCutPhaseFormFormType::class, $exercisePhase),
            ExercisePhaseType::REFLEXION => $this->createForm(ReflexionPhaseFormType::class, $exercisePhase),
            ExercisePhaseType::MATERIAL => $this->createForm(MaterialPhaseFormType::class, $exercisePhase),
        };
    }

    private function addVideoAnalyseExercisePhaseEditedEvent(VideoAnalysisPhase $phase)
    {
        $this->eventStore->addEvent('VideoAnalyseExercisePhaseEdited', [
            'exercisePhaseId' => $phase->getId(),
            'name' => $phase->getName(),
            'task' => $phase->getTask(),
            'isGroupPhase' => $phase->isGroupPhase(),
            'dependsOnPreviousPhase' => $phase->getDependsOnExercisePhase() !== null,
            'videos' => $phase->getVideos()->map(fn (Video $video) => [
                'videoId' => $video->getId()
            ])->toArray(),
            'videoCodes' => $phase->getVideoCodes()->map(fn (VideoCode $videoCode) => [
                'videoCodeId' => $videoCode->getId()
            ])->toArray(),
            'components' => $phase->getComponents()
        ]);
    }

    private function addVideoCutExercisePhaseEditedEvent(VideoCutPhase $phase)
    {
        $this->eventStore->addEvent('VideoCutExercisePhaseEdited', [
            'exercisePhaseId' => $phase->getId(),
            'name' => $phase->getName(),
            'task' => $phase->getTask(),
            'isGroupPhase' => $phase->isGroupPhase(),
            'dependsOnPreviousPhase' => $phase->getDependsOnExercisePhase() !== null,
            'videos' => $phase->getVideos()->map(fn (Video $video) => [
                'videoId' => $video->getId()
            ])->toArray(),
            'components' => $phase->getComponents()
        ]);
    }

    private function addReflexionExercisePhaseEditedEvent(ReflexionPhase $phase)
    {
        $this->eventStore->addEvent('ReflexionExercisePhaseEdited', [
            'exercisePhaseId' => $phase->getId(),
            'name' => $phase->getName(),
            'task' => $phase->getTask(),
            'isGroupPhase' => $phase->isGroupPhase(),
            'dependsOnPreviousPhase' => $phase->getDependsOnExercisePhase() !== null,
            'components' => $phase->getComponents()
        ]);
    }

    private function addMaterialExercisePhaseEditedEvent(MaterialPhase $phase)
    {
        $this->eventStore->addEvent('MaterialExercisePhaseEdited', [
            'exercisePhaseId' => $phase->getId(),
            'name' => $phase->getName(),
            'task' => $phase->getTask(),
            'isGroupPhase' => $phase->isGroupPhase(),
            'dependsOnPreviousPhase' => $phase->getDependsOnExercisePhase() !== null,
            'components' => $phase->getComponents()
        ]);
    }

    private function addExercisePhaseEditedEvent(ExercisePhase $phase)
    {
        switch ($phase->getType()) {
            case ExercisePhaseType::VIDEO_ANALYSIS:
                /** @var VideoAnalysisPhase $phase */
                $this->addVideoAnalyseExercisePhaseEditedEvent($phase);
                break;
            case ExercisePhaseType::VIDEO_CUT:
                /** @var VideoCutPhase $phase */
                $this->addVideoCutExercisePhaseEditedEvent($phase);
                break;
            case ExercisePhaseType::REFLEXION:
                /** @var ReflexionPhase $phase */
                $this->addReflexionExercisePhaseEditedEvent($phase);
                break;
            case ExercisePhaseType::MATERIAL:
                /** @var MaterialPhase $phase */
                $this->addMaterialExercisePhaseEditedEvent($phase);
                break;
        }
    }
}
