<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\UserExerciseInteraction;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExerciseType;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\ExerciseRepository;
use App\Repository\Exercise\UserExerciseInteractionRepository;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ExerciseController extends AbstractController
{
    private CourseRepository $courseRepository;
    private ExerciseRepository $exerciseRepository;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private UserExerciseInteractionRepository $userExerciseInteractionRepository;
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExerciseService $exerciseService;

    private LoggerInterface $logger;

    /**
     * @param CourseRepository $courseRepository
     * @param ExerciseRepository $exerciseRepository
     * @param TranslatorInterface $translator
     */
    public function __construct(
        CourseRepository $courseRepository,
        ExerciseRepository $exerciseRepository,
        ExercisePhaseRepository $exercisePhaseRepository,
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        UserExerciseInteractionRepository $userExerciseInteractionRepository,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        LoggerInterface $logger
    )
    {
        $this->courseRepository = $courseRepository;
        $this->exerciseRepository = $exerciseRepository;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->userExerciseInteractionRepository = $userExerciseInteractionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->logger = $logger;
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/show/{id}/{phaseId}", name="exercise-overview__exercise--show")
     */
    public function show(Request $request, Exercise $exercise, string $phaseId = ''): Response
    {
        $template = 'Exercise/Show.html.twig';

        /* @var User $user */
        $user = $this->getUser();
        $userIsCreator = $user === $exercise->getCreator();

        $userExerciseInteraction = $this->userExerciseInteractionRepository->findOneBy(['user' => $user, 'exercise' => $exercise]);

        if (!$userExerciseInteraction) {
            $userExerciseInteraction = new UserExerciseInteraction();
            $userExerciseInteraction->setExercise($exercise);
            $userExerciseInteraction->setUser($user);
            $userExerciseInteraction->setOpened(true);

            $this->eventStore->disableEventPublishingForNextFlush();
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($userExerciseInteraction);
            $entityManager->flush();
        }

        if ($phaseId) {
            /* @var ExercisePhase $exercisePhase */
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
                return  $this->isGranted('viewExercisePhaseTeam', $team);
            });

            // WHY: Make sure the first team that's shown is the team of the current user
            $allTeams = $teamOfCurrentUser ? array_merge([$teamOfCurrentUser], $otherTeams) : $otherTeams;

            return $this->render($template,
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
        } else {
            $template = 'Exercise/ShowOverview.html.twig';

            $nextExercisePhase = $this->exercisePhaseRepository->findFirstExercisePhase($exercise);

            return $this->render($template,
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
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/finish/{id}", name="exercise-overview__exercise--finish")
     */
    public function finish(Request $request, Exercise $exercise): Response
    {
        /* @var User $user */
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
            /* @var Exercise $exercise */
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

    private function getExerciseHasSolutions(Exercise $exercise): bool {
        $phases = $exercise->getPhases()->toArray();

        return array_reduce($phases, function($carry, $phase) {
            return $carry || $phase->getHasSolutions();
        }, false);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/change-status", name="exercise-overview__exercise--change-status")
     */
    public function changeStatus(Request $request, Exercise $exercise): Response
    {
        $newStatus = (int) $request->query->get('status', Exercise::EXERCISE_CREATED);
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
}
