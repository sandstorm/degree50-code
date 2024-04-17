<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
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
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
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
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ExercisePhaseController extends AbstractController
{

    public function __construct(
        private readonly TranslatorInterface          $translator,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly LiveSyncService              $liveSyncService,
        private readonly RouterInterface              $router,
        private readonly ExercisePhaseRepository      $exercisePhaseRepository,
        private readonly ExercisePhaseService         $exercisePhaseService,
        private readonly ExercisePhaseTeamRepository  $exercisePhaseTeamRepository,
        private readonly SolutionService              $solutionService,
        private readonly ExerciseService              $exerciseService,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @Security("is_granted('showSolution', exercisePhaseTeam) or is_granted('show', exercisePhaseTeam)")
     * @Route("/exercise-phase/show/{id}/{team_id}", name="exercise-phase__show")
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

    /**
     * @IsGranted("test", subject="exercisePhase")
     * @Route("/exercise-phase/test/{id}/{team_id}", name="exercise-phase__test")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function test(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response {
        $this->exercisePhaseService->openPhase($exercisePhaseTeam);

        if ($exercisePhase->getType() === ExercisePhaseType::REFLEXION) {
            return $this->reflectInPhase($exercisePhase, $exercisePhaseTeam, true);
        } else {
            return $this->workOnPhase($exercisePhase, $exercisePhaseTeam, true);
        }
    }

    /**
     * @IsGranted("test", subject="exercisePhase")
     * @Route("/exercise-phase/test/{id}/{team_id}/reset", name="exercise-phase__reset-test")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function resetTest(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam
    ): Response {
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->remove($exercisePhaseTeam);
        $this->entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhase.resetTest.messages.success', [], 'forms')
        );

        return $this->redirectToRoute(
            'exercise__show-test-phase',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    private function reflectInPhase(
        ExercisePhase $reflexionPhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        bool $testMode = false
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $phaseReflexionDependsOn = $reflexionPhase->getDependsOnExercisePhase();
        $exercise = $reflexionPhase->getBelongsToExercise();

        $teams = [];
        if ($testMode && $exercisePhaseTeam->getSolution() !== null) {
            $teams[] = $exercisePhaseTeam;
        } else {
            $teams = $this->exercisePhaseTeamRepository->findAllByPhaseExcludingTests($phaseReflexionDependsOn);
            // HOTFIX: It's possible to create a team without solutions right now, e.g. when a user creates a team in a
            // group phase and does not start the phase for this group at least once.
            // This leads to an 500 Error down the line, when the cut video of the solution is accessed. (can't get a
            // cut video from a solution that does not exist).
            // This is a quick fix and should be addressed with more insight later.
            $teams = array_filter($teams, fn ($team) => $team->getSolution() !== null);
        }

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilderForSolutionView(
            $clientSideSolutionDataBuilder,
            $teams
        );

        $configOfDependingPhase = $this->exercisePhaseService->getConfig($phaseReflexionDependsOn, $user);

        return $this->render('ExercisePhase/Show.html.twig', [
            'config' => array_merge($this->exercisePhaseService->getConfig($reflexionPhase, $user), [
                'type' => $configOfDependingPhase['type'],
                'videos' => $configOfDependingPhase['videos'],
            ]),
            'data' => $clientSideSolutionDataBuilder,
            'exercise' => $exercise,
            'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'exercisePhase' => $reflexionPhase,
            'testMode' => $testMode,
        ]);
    }

    private function workOnPhase(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        bool $testMode = false
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        // config for the ui to render the react components
        $config = $this->getConfigWithSolutionApiEndpoints($exercisePhase, $exercisePhaseTeam);

        $this->initiateExercisePhaseTeamWithSolution($exercisePhase, $exercisePhaseTeam, $user);

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhaseTeam));

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $exercise = $exercisePhase->getBelongsToExercise();

        return $this->render('ExercisePhase/Show.html.twig', [
            'config' => $config,
            'data' => $clientSideSolutionDataBuilder,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercise,
            'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId(),
            'testMode' => $testMode,
        ], $response);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/{id}/edit/phase/new", name="exercise-phase__new")
     */
    public function new(Exercise $exercise): Response
    {
        $types = [];

        foreach (ExercisePhaseType::getPossibleValues() as $type) {
            $types[] = [
                'id' => $type,
                'iconClass' => $this->translator->trans('exercisePhase.types.' . $type . '.iconClass', [], 'forms'),
                'label' => $this->translator->trans('exercisePhase.types.' . $type . '.label', [], 'forms')
            ];
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'types' => $types,
            'exercise' => $exercise,
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/{id}/edit/phase/type", name="exercise-phase__set-type")
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
     * @Route("/exercise/{id}/edit/phase/{phase_id}/edit", name="exercise-phase__edit")
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
     * @Route("/exercise-phase-solution/finish-review/{id}", name="exercise-phase-solution__finish-review", methods={"POST"})
     */
    public function finishReview(Solution $solution): Response
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
     * @Route("/exercise/{id}/edit/phase/{phase_id}/change-sorting", name="exercise-phase__change-sorting")
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
        $this->entityManager->persist($exercisePhase);
        $this->entityManager->persist($exercisePhaseAtNewSortIndex);
        $this->entityManager->flush();

        return $this->redirectToRoute('exercise__edit', ['id' => $exercise->getId()]);
    }


    /**
     * @IsGranted("delete", subject="exercisePhase")
     * @Route("/exercise/{id}/edit/phase/{phase_id}/delete", name="exercise-phase__delete")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function delete(Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $this->exercisePhaseService->deleteExercisePhase($exercisePhase);

        // Update sorting
        /** @var ExercisePhase[] $remainingPhases */
        $remainingPhases = $this->exercisePhaseRepository->findAllSortedBySorting($exercise);

        foreach ($remainingPhases as $index => $phase) {
            $this->addExercisePhaseEditedEvent($phase);

            $phase->setSorting($index);
            $this->entityManager->persist($phase);
        }

        $this->entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhase.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise__edit', ['id' => $exercise->getId()]);
    }

    /**
     * @Security("is_granted('showSolution', exercisePhaseTeam) or is_granted('show', exercisePhaseTeam)")
     * @Route("/exercise-phase/show-others/{id}/{team_id}", name="exercise-phase__show-other-solution")
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
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user, $exercisePhaseTeam));

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $exercise = $exercisePhase->getBelongsToExercise();

        return $this->render('ExercisePhase/ShowSolution.html.twig', [
            'config' => $config,
            'data' => $clientSideSolutionDataBuilder,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercise' => $exercise,
            'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'currentEditor' => null
        ], $response);
    }

    private function initiateExercisePhaseTeamWithSolution(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        User $user
    ): void {
        if (!$exercisePhaseTeam->getCurrentEditor()) {
            $exercisePhaseTeam->setCurrentEditor($user);
        }

        $this->eventStore->disableEventPublishingForNextFlush();

        if (!$exercisePhaseTeam->getSolution()) {
            $this->initNewSolution($exercisePhase, $exercisePhaseTeam);
        }

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();
    }

    private function initNewSolution(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): void
    {
        $this->eventStore->disableEventPublishingForNextFlush();

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

        $this->entityManager->persist($newSolution);
    }

    private function getConfigWithSolutionApiEndpoints(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam,
        ?bool $readOnly = false
    ): array {
        /** @var User $user */
        $user = $this->getUser();
        $config = $this->exercisePhaseService->getConfig($exercisePhase, $user, $readOnly);
        $config['apiEndpoints'] = [
            'updateSolution' => $this->router->generate('exercise-phase-team__update-solution', [
                'id' => $exercisePhaseTeam->getId()
            ]),
            'updateCurrentEditor' => $this->router->generate('exercise-phase-team__update-current-editor', [
                'id' => $exercisePhaseTeam->getId()
            ]),
        ];

        return $config;
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

        $this->entityManager->persist($exercisePhase);
        $this->entityManager->flush();

        return $this->redirectToRoute('exercise-phase__edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
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

            return $this->redirectToRoute('exercise-phase__edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        } else if ($this->hasNoActiveComponent($exercisePhase)) {
            $this->addFlash(
                'danger',
                'Mindestens eine Komponente muss aktiv sein'
            );

            return $this->redirectToRoute('exercise-phase__edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        } else {
            $this->entityManager->persist($exercisePhase);
            $this->entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhase.edit.messages.success', [], 'forms')
            );
        }

        return $this->redirectToRoute('exercise-phase__edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
    }

    private function hasNoActiveComponent(ExercisePhase $exercisePhase): bool
    {
        $isVideoAnalysis = $exercisePhase->getType() == ExercisePhaseType::VIDEO_ANALYSIS;

        if (!$isVideoAnalysis) {
            return false;
        }

        /** @var VideoAnalysisPhase $exercisePhase */
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

    private function addVideoAnalyseExercisePhaseEditedEvent(VideoAnalysisPhase $phase): void
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
            'components' => []
        ]);
    }

    private function addVideoCutExercisePhaseEditedEvent(VideoCutPhase $phase): void
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
            'components' => []
        ]);
    }

    private function addReflexionExercisePhaseEditedEvent(ReflexionPhase $phase): void
    {
        $this->eventStore->addEvent('ReflexionExercisePhaseEdited', [
            'exercisePhaseId' => $phase->getId(),
            'name' => $phase->getName(),
            'task' => $phase->getTask(),
            'isGroupPhase' => $phase->isGroupPhase(),
            'dependsOnPreviousPhase' => $phase->getDependsOnExercisePhase() !== null,
            'components' => []
        ]);
    }

    private function addMaterialExercisePhaseEditedEvent(MaterialPhase $phase): void
    {
        $this->eventStore->addEvent('MaterialExercisePhaseEdited', [
            'exercisePhaseId' => $phase->getId(),
            'name' => $phase->getName(),
            'task' => $phase->getTask(),
            'isGroupPhase' => $phase->isGroupPhase(),
            'dependsOnPreviousPhase' => $phase->getDependsOnExercisePhase() !== null,
            'components' => []
        ]);
    }

    private function addExercisePhaseEditedEvent(ExercisePhase $phase): void
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
