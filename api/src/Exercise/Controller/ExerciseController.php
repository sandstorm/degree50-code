<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\CopyExerciseFormType;
use App\Exercise\Form\ExerciseType;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\UserExerciseInteractionRepository;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ExerciseController extends AbstractController
{
    private ExercisePhaseRepository $exercisePhaseRepository;
    private ExercisePhaseService $exercisePhaseService;
    private UserExerciseInteractionRepository $userExerciseInteractionRepository;
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExerciseService $exerciseService;
    private UserExerciseInteractionService $userExerciseInteractionService;
    private Security $security;

    private LoggerInterface $logger;

    public function __construct(
        ExercisePhaseRepository $exercisePhaseRepository,
        ExercisePhaseService $exercisePhaseService,
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        ExerciseService $exerciseService,
        UserExerciseInteractionRepository $userExerciseInteractionRepository,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        UserExerciseInteractionService $userExerciseInteractionService,
        LoggerInterface $logger,
        Security $security,
    )
    {
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->userExerciseInteractionRepository = $userExerciseInteractionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->exerciseService = $exerciseService;
        $this->userExerciseInteractionService = $userExerciseInteractionService;
        $this->logger = $logger;
        $this->security = $security;
    }

    /**
     * This action is responsible for showing the phase overview screen from which a student
     * is able to start solving the phase or seeing other students solutions.
     *
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/show-phase-overview/{id}/{phaseId}", name="exercise-overview__exercise--show-phase-overview")
     */
    public function showPhaseOverview(Exercise $exercise, string $phaseId = ''): Response
    {

        /** @var User $user */
        $user = $this->getUser();
        $userIsCreator = $user === $exercise->getCreator();

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->exercisePhaseRepository->find($phaseId);

        $previousExercisePhase = $this->exercisePhaseRepository->findExercisePhaseBefore($exercisePhase);
        $nextExercisePhase = $this->exercisePhaseRepository->findExercisePhaseAfter($exercisePhase);

        $teamOfCurrentUser = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);
        $otherTeams = array_filter($this->exercisePhaseTeamRepository->findByExercisePhase($exercisePhase), function ($team) use ($teamOfCurrentUser) {
            // filter out team of current user
            if ($team === $teamOfCurrentUser) {
                return false;
            }
            // only show teams that the user is allowed to see
            return $this->isGranted('viewExercisePhaseTeam', $team);
        });

        // WHY: Make sure the first team that's shown is the team of the current user
        $allTeams = $teamOfCurrentUser ? array_merge([$teamOfCurrentUser], $otherTeams) : $otherTeams;

        return $this->render(
            'Exercise/Show.html.twig',
            [
                'userIsCreator' => $userIsCreator,
                'exercise' => $exercise,
                'exercisePhase' => $exercisePhase,
                'currentPhaseIndex' => $exercisePhase->getSorting(),
                'previousExercisePhase' => $previousExercisePhase,
                'nextExercisePhase' => $nextExercisePhase,
                'teams' => $allTeams,
                'otherTeams' => $otherTeams,
                'teamOfCurrentUser' => $teamOfCurrentUser,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
            ]);
    }

    /**
     * This actions is responsible for showing the general overview of an exercise.
     * This includes the exercise description as well as an overview of phases.
     *
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/show-overview/{id}}", name="exercise-overview__exercise--show-overview")
     */
    public function showOverview(Exercise $exercise): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $userIsCreator = $user === $exercise->getCreator();

        $userExerciseInteraction = $this
            ->userExerciseInteractionRepository
            ->findOneBy(['user' => $user, 'exercise' => $exercise]);

        if (!$userExerciseInteraction) {
            $this->userExerciseInteractionService->setUserOpenedExercise($user, $exercise);
        }

        $nextExercisePhase = $this->exercisePhaseRepository->findFirstExercisePhase($exercise);

        return $this->render(
            'Exercise/ShowOverview.html.twig',
            [
                'userIsCreator' => $userIsCreator,
                'exercise' => $exercise,
                'exercisePhase' => null,
                'previousExercisePhase' => null,
                'currentPhaseIndex' => false,
                'nextExercisePhase' => $nextExercisePhase,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
            ]);
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/finish/{id}", name="exercise-overview__exercise--finish")
     */
    public function finish(Exercise $exercise): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $userExerciseInteraction = $this->userExerciseInteractionRepository->findOneBy(['user' => $user, 'exercise' => $exercise]);

        $userExerciseInteraction->setFinished(true);

        $this->eventStore->addEvent('UserFinishedExercise', [
            'exerciseId' => $exercise->getId(),
            'userId' => $user->getId(),
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($userExerciseInteraction);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview', ['id' => $exercise->getCourse()->getId()]);
    }

    /**
     * @IsGranted("newExercise", subject="course")
     * @Route("/exercise/new/{id}", name="exercise-overview__exercise--new")
     */
    public function new(Request $request, Course $course): Response
    {
        $exercise = new Exercise();
        $exercise->setCourse($course);

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

            return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);
        }

        return $this->render('Exercise/New.html.twig', [
            'course' => $course,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}", name="exercise-overview__exercise--edit")
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

            return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);
        }

        $exerciseHasSolutions = $this->getExerciseHasSolutions($exercise);

        return $this->render('Exercise/Edit.html.twig', [
            'exercise' => $exercise,
            'exerciseHasSolutions' => $exerciseHasSolutions,
            'form' => $form->createView()
        ]);
    }

    private function getExerciseHasSolutions(Exercise $exercise): bool
    {
        $phases = $exercise->getPhases()->toArray();

        return array_reduce($phases, function ($carry, $phase) {
            return $carry || $phase->getHasSolutions();
        }, false);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/change-status", name="exercise-overview__exercise--change-status")
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

            return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);
        }

        $this->eventStore->addEvent('ExerciseStatusUpdated', [
            'exerciseId' => $exercise->getId(),
            'status' => $newStatus,
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercise);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $exercise->getId()]);
    }

    /**
     * @IsGranted("delete", subject="exercise")
     * @Route("/exercise/delete/{id}", name="exercise-overview__exercise--delete")
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
     * TODO: special authorization?
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/copy/{id}", name="exercise-overview__exercise--copy")
     */
    public function copy(Request $request, Exercise $exercise): Response
    {
        // Exercise that is exclusively used by the form
        // WHY: using the original Exercise in the form will automatically change and persist it but we want
        //      to keep the original Exercise untouched
        $transientExercise = new Exercise();
        $transientExercise->setName($exercise->getName());
        $transientExercise->setDescription($exercise->getDescription());
        $transientExercise->setCreator($exercise->getCreator());
        $transientExercise->setCreatedAtValue();
        $transientExercise->setStatus($exercise->getStatus());
        $transientExercise->setCourse($exercise->getCourse());

        $form = $this->createForm(CopyExerciseFormType::class, $transientExercise);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            /**
             * @var Exercise $updatedTransientExercise
             */
            $updatedTransientExercise = $form->getData();

            $selectedCourse = $updatedTransientExercise->getCourse();

            /** @var User $user */
            $user = $this->security->getUser();

            // WHY: If 'copyPhases' is set to 'false' in form then the array key does (somehow) not exists
            $copyPhases = array_key_exists('copyPhases', $request->request->get('copy_exercise_form'))
                && $request->request->get('copy_exercise_form')['copyPhases'];

            /**
             * The new copy of the exercise that will be persisted
             */
            $newExercise = new Exercise();

            // copy stuff over to new Exercise
            $newExercise->setName($updatedTransientExercise->getName());
            $newExercise->setDescription($updatedTransientExercise->getDescription());
            // set creator to current user performing the action
            $newExercise->setCreator($user);
            $newExercise->setCreatedAtValue();
            // set status to "created" (unpublished)
            $newExercise->setStatus(Exercise::EXERCISE_CREATED);
            // set course to Course the user selected in form
            $newExercise->setCourse($selectedCourse);

            // create new ExercisePhases by duplicating the original ones
            if ($copyPhases) {
                // mutates
                $newPhases = $this->exercisePhaseService->duplicatePhasesOfExerciseToExercise($exercise, $newExercise);
                $newExercise->setPhases($newPhases);
            }

            $this->eventStore->addEvent('ExerciseCreated', [
                'exerciseId' => $newExercise->getId(),
                'courseId' => $selectedCourse->getId(),
                'name' => $newExercise->getName(),
                'description' => $newExercise->getDescription(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($newExercise);
            $entityManager->flush();

            return $this->redirectToRoute('exercise-overview__exercise--edit', ['id' => $newExercise->getId()]);
        }

        return $this->render('Exercise/Copy.html.twig', [
            'exercise' => $exercise,
            'form' => $form->createView()
        ]);
    }
}
