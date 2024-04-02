<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\CopyExerciseFormDto;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\Form\CopyExerciseFormType;
use App\Exercise\Form\ExerciseType;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ExerciseController extends AbstractController
{
    private ExercisePhaseRepository $exercisePhaseRepository;
    private ExercisePhaseService $exercisePhaseService;
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExerciseService $exerciseService;

    private SolutionService $solutionService;

    public function __construct(
        ExercisePhaseRepository $exercisePhaseRepository,
        ExercisePhaseService $exercisePhaseService,
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        ExerciseService $exerciseService,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        SolutionService $solutionService
    ) {
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->exerciseService = $exerciseService;
        $this->solutionService = $solutionService;
    }

    /**
     * This actions is responsible for showing the general overview of an exercise.
     * This includes the exercise description as well as an overview of phases.
     *
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/{id}/show", name="exercise__show")
     */
    public function show(Exercise $exercise): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $nextExercisePhase = $this->exercisePhaseRepository->findFirstExercisePhase($exercise);

        return $this->render(
            'Exercise/Show.html.twig',
            [
                'testMode' => false,
                'exercise' => $exercise,
                'exercisePhase' => null,
                'previousExercisePhase' => null,
                'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
                'currentPhaseIndex' => false,
                'nextExercisePhase' => $nextExercisePhase,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
            ]
        );
    }

    /**
     * Version for testing of showOverview()
     *
     * @IsGranted("test", subject="exercise")
     * @Route("/exercise/{id}/test", name="exercise__test")
     */
    public function test(Exercise $exercise): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $nextExercisePhase = $this->exercisePhaseRepository->findFirstExercisePhase($exercise);

        return $this->render(
            'Exercise/Show.html.twig',
            [
                'testMode' => true,
                'exercise' => $exercise,
                'exercisePhase' => null,
                'previousExercisePhase' => null,
                'phases' => $this->exerciseService->getPhasesForTesting($exercise,),
                'currentPhaseIndex' => false,
                'nextExercisePhase' => $nextExercisePhase,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
            ]
        );
    }

    /**
     * This action is responsible for showing the phase overview screen from which a student
     * is able to start solving the phase or seeing other students solutions.
     *
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/{id}/phase/{phaseId}", name="exercise__show-phase")
     */
    public function showExercisePhase(Exercise $exercise, string $phaseId = ''): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->exercisePhaseRepository->find($phaseId);

        $previousExercisePhase = $this->exercisePhaseRepository->findExercisePhaseBefore($exercisePhase);
        $nextExercisePhase = $this->exercisePhaseRepository->findExercisePhaseAfter($exercisePhase);

        $teamOfCurrentUser = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($user, $exercisePhase);
        if ($teamOfCurrentUser) {
            $otherTeams = $this->exercisePhaseTeamRepository->findOtherTeamsByPhaseExcludingTests($exercisePhase, $teamOfCurrentUser);
        } else {
            $otherTeams = $this->exercisePhaseTeamRepository->findAllByPhaseExcludingTests($exercisePhase);
        }

        // WHY: Make sure the first team that's shown is the team of the current user
        $allTeams = $teamOfCurrentUser ? array_merge([$teamOfCurrentUser], $otherTeams) : $otherTeams;

        return $this->render(
            'Exercise/ShowPhase.html.twig',
            [
                'testMode' => false,
                'exercise' => $exercise,
                'exercisePhase' => $exercisePhase,
                'phases' => $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user),
                'currentPhaseIndex' => $exercisePhase->getSorting(),
                'previousExercisePhase' => $previousExercisePhase,
                'nextExercisePhase' => $nextExercisePhase,
                'teams' => $allTeams,
                'otherTeams' => $otherTeams,
                'teamOfCurrentUser' => $teamOfCurrentUser,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
            ]
        );
    }

    /**
     * Version for testing of showExercisePhase()
     * Removes other teams and only shows the team of the current user.
     *
     * @IsGranted("test", subject="exercise")
     * @Route("/exercise/test/{id}/phase/{phaseId}", name="exercise__show-test-phase")
     */
    public function showTestExercisePhase(Exercise $exercise, string $phaseId = ''): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->exercisePhaseRepository->find($phaseId);

        $previousExercisePhase = $this->exercisePhaseRepository->findExercisePhaseBefore($exercisePhase);
        $nextExercisePhase = $this->exercisePhaseRepository->findExercisePhaseAfter($exercisePhase);

        $teamOfCurrentUser = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($user, $exercisePhase, true);

        $teams = [];

        if ($teamOfCurrentUser !== null) {
            $teams[] = $teamOfCurrentUser;
        }

        return $this->render(
            'Exercise/ShowPhase.html.twig',
            [
                'testMode' => true,
                'exercise' => $exercise,
                'exercisePhase' => $exercisePhase,
                'phases' => $this->exerciseService->getPhasesForTesting($exercise),
                'currentPhaseIndex' => $exercisePhase->getSorting(),
                'previousExercisePhase' => $previousExercisePhase,
                'nextExercisePhase' => $nextExercisePhase,
                'teams' => $teams,
                'otherTeams' => [],
                'teamOfCurrentUser' => $teamOfCurrentUser,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
            ]
        );
    }

    /**
     * @IsGranted("newExercise", subject="course")
     * @Route("/exercise/new/{id}", name="exercise__new")
     */
    public function new(Request $request, Course $course): Response
    {
        $exercise = new Exercise();
        $exercise->setCourse($course);
        /** @var User $user */
        $user = $this->getUser();
        $exercise->setCreator($user);

        $form = $this->createForm(ExerciseType::class, $exercise);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // $form->getData() holds the submitted values
            // but, the original `$exercise` variable has also been updated
            $exercise = $form->getData();

            $this->eventStore->addEvent('ExerciseCreated', [
                'exerciseId' => $exercise->getId(),
                'courseId' => $course->getId(),
                'name' => $exercise->getName(),
                'description' => $exercise->getDescription(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercise);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('exercise.new.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise__edit', ['id' => $exercise->getId()]);
        }

        return $this->render('Exercise/New.html.twig', [
            'course' => $course,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/{id}/edit", name="exercise__edit")
     */
    public function edit(Request $request, Exercise $exercise): Response
    {
        $form = $this->createForm(ExerciseType::class, $exercise);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            // $form->getData() holds the submitted values
            // but, the original `$exercise` variable has also been updated
            /** @var Exercise $exercise */
            $exercise = $form->getData();

            $this->eventStore->addEvent('ExerciseNameOrDescriptionUpdated', [
                'exerciseId' => $exercise->getId(),
                'name' => $exercise->getName(),
                'description' => $exercise->getDescription(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercise);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('exercise.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise__edit', ['id' => $exercise->getId()]);
        }

        $exerciseHasSolutions = $this->getExerciseHasSolutions($exercise);

        $exercisePhases = $exercise->getPhases()->toArray();

        $phasesWithAllowedSortingIndication = array_map(function ($index, ExercisePhase $phase) use ($exercisePhases) {
            $previousPhase = $index === 0 ? null : $exercisePhases[$index - 1];
            $canMoveUp = $phase->getDependsOnExercisePhase() !== $previousPhase;

            /**
             * @var ExercisePhase
             */
            $nextPhase = $index === count($exercisePhases) - 1 ? null : $exercisePhases[$index + 1];
            $canMoveDown = $nextPhase && $nextPhase->getDependsOnExercisePhase() !== $phase;

            return [
                "phase" => $phase,
                "canMoveUp" => $canMoveUp,
                "canMoveDown" => $canMoveDown,
            ];
        }, array_keys($exercisePhases), $exercisePhases);

        return $this->render('Exercise/Edit.html.twig', [
            'exercise' => $exercise,
            'exercisePhases' => $phasesWithAllowedSortingIndication,
            'exerciseHasSolutions' => $exerciseHasSolutions,
            'form' => $form->createView()
        ]);
    }

    private function getExerciseHasSolutions(Exercise $exercise): bool
    {
        $phases = $exercise->getPhases()->toArray();

        /** @var ExercisePhase $phase */
        foreach ($phases as $phase) {
            if ($phase->getHasSolutions()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/{id}/edit/change-status", name="exercise__change-status")
     */
    public function changeStatus(Request $request, Exercise $exercise): Response
    {
        $newStatus = (int)$request->query->get('status', Exercise::EXERCISE_CREATED);
        $exercise->setStatus($newStatus);

        if ($newStatus == Exercise::EXERCISE_PUBLISHED && count($exercise->getPhases()) == 0) {
            $this->addFlash(
                'danger',
                'Aufgabe hat noch keine Phasen!'
            );

            return $this->redirectToRoute('exercise__edit', ['id' => $exercise->getId()]);
        }

        $this->eventStore->addEvent('ExerciseStatusUpdated', [
            'exerciseId' => $exercise->getId(),
            'status' => $newStatus,
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercise);
        $entityManager->flush();

        return $this->redirectToRoute('exercise__edit', ['id' => $exercise->getId()]);
    }

    /**
     * @IsGranted("delete", subject="exercise")
     * @Route("/exercise/{id}/delete", name="exercise__delete")
     */
    public function delete(Exercise $exercise): Response
    {
        $this->exerciseService->deleteExercise($exercise);

        $this->addFlash(
            'success',
            $this->translator->trans('exercise.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview', ['id' => $exercise->getCourse()->getId()]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/{id}/copy", name="exercise__copy")
     */
    public function copy(Request $request, Exercise $exercise): Response
    {
        $form = $this->createForm(CopyExerciseFormType::class, CopyExerciseFormDto::fromExercise($exercise));

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /**
             * @var CopyExerciseFormDto $formDto
             */
            $formDto = $form->getData();

            /** @var User $user */
            $user = $this->getUser();

            /**
             * The new copy of the exercise that will be persisted
             */
            $newExercise = new Exercise();

            // copy stuff over to new Exercise
            $newExercise->setName('Kopie - ' . $exercise->getName());
            $newExercise->setDescription($exercise->getDescription());
            // set creator to current user performing the action
            $newExercise->setCreator($user);
            $newExercise->setCreatedAtValue();
            // set status to "created" (unpublished)
            $newExercise->setStatus(Exercise::EXERCISE_CREATED);
            // set course to Course the user selected in form
            $newExercise->setCourse($formDto->getCourse());

            // create new ExercisePhases by duplicating the original ones
            if ($formDto->getCopyPhases()) {
                $newPhases = $this->exercisePhaseService->duplicatePhasesOfExercise($exercise, $newExercise);
                $newExercise->setPhases($newPhases);
            }

            $this->eventStore->addEvent('ExerciseCreated', [
                'exerciseId' => $newExercise->getId(),
                'courseId' => $formDto->getCourse()->getId(),
                'name' => $newExercise->getName(),
                'description' => $newExercise->getDescription(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($newExercise);
            $entityManager->flush();

            return $this->redirectToRoute('exercise__edit', ['id' => $newExercise->getId()]);
        }

        return $this->render('Exercise/Copy.html.twig', [
            'exercise' => $exercise,
            'form' => $form->createView()
        ]);
    }

    /**
     * FIXME: It is possible that there are Exercises with no Phases! This currently just throws a 500 Error, but shouldn't!
     *
     * @IsGranted("showSolution", subject="exercise")
     * @Route("/exercise/{id}/show-solutions/{phaseId?}", name="exercise__show-solutions")
     */
    public function showSolutions(Request $request, Exercise $exercise): Response
    {
        $phaseId = $request->get('phaseId');

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $phaseId
            ? $this->exercisePhaseRepository->find($phaseId)
            : $exercise->getPhases()->first();

        $teams = $this->exercisePhaseTeamRepository->findAllByPhaseExcludingTests($exercisePhase);

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

        /** @var User $user */
        $user = $this->getUser();
        $phases = $this->exerciseService->getPhasesWithStatusMetadata($exercise, $user);

        return $this->render('ExercisePhase/ShowSolutions.html.twig', [
            'config' => $this->exercisePhaseService->getConfig($exercisePhase, $user,true),
            'data' => $data,
            'exercise' => $exercise,
            'phases' => $phases,
            'currentExercisePhase' => $exercisePhase,
            'hasSolutions' => $exercisePhase->getHasSolutions()
        ]);
    }
}
