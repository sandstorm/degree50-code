<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\UserExerciseInteraction;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExerciseType;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\ExerciseRepository;
use App\Repository\Exercise\UserExerciseInteractionRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExerciseController extends AbstractController
{
    private CourseRepository $courseRepository;
    private ExerciseRepository $exerciseRepository;
    private UserExerciseInteractionRepository $userExerciseInteractionRepository;
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;

    /**
     * @param CourseRepository $courseRepository
     * @param ExerciseRepository $exerciseRepository
     * @param TranslatorInterface $translator
     */
    public function __construct(CourseRepository $courseRepository, ExerciseRepository $exerciseRepository, TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, UserExerciseInteractionRepository $userExerciseInteractionRepository, ExercisePhaseTeamRepository $exercisePhaseTeamRepository)
    {
        $this->courseRepository = $courseRepository;
        $this->exerciseRepository = $exerciseRepository;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->userExerciseInteractionRepository = $userExerciseInteractionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/show/{id}/{phaseIndex<\d+>}", name="exercise-overview__exercise--show")
     */
    public function show(Request $request, Exercise $exercise, int $phaseIndex = 0): Response
    {
        $showSolution = $request->get('showSolution');

        $template = 'Exercise/Show.html.twig';
        if ($showSolution) {
            if ($this->getUser() !== $exercise->getCreator()) {
                $this->addFlash(
                    'danger',
                    $this->translator->trans('exercise.showSolution.messages.error', [], 'forms')
                );
                return $this->redirectToRoute('exercise-overview--show-course', ['id' => $exercise->getCourse()->getId()]);
            }
            $template = 'Exercise/ShowSolution.html.twig';
        }

        /* @var User $user */
        $user = $this->getUser();

        /* @var ExercisePhase $exercisePhase */
        $exercisePhase = $exercise->getPhases()->get($phaseIndex);
        $teams = $this->exercisePhaseTeamRepository->findAllCreatedByOtherUsers($user, $exercisePhase);
        $teamOfCurrentUser = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);

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

        return $this->render($template,
            [
                'exercise' => $exercise,
                'exercisePhase' => $exercisePhase,
                'currentPhaseIndex' => $phaseIndex,
                'teams' => $teams,
                'teamOfCurrentUser' => $teamOfCurrentUser,
                'amountOfPhases' => count($exercise->getPhases()) - 1,
                'showSolution' => $showSolution
            ]);
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

        return $this->redirectToRoute('exercise-overview--show-course', ['id' => $exercise->getCourse()->getId()]);
    }

    /**
     * @Route("/exercise/new", name="exercise-overview__exercise--new")
     */
    public function new(Request $request): Response
    {
        $courseId = $request->query->get('courseId', null);

        $exercise = new Exercise();

        $course = null;
        if ($courseId) {
            $course = $this->courseRepository->find($courseId);
            $exercise->setCourse($course);
        }

        $form = $this->createForm(ExerciseType::class, $exercise);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            // $form->getData() holds the submitted values
            // but, the original `$exercise` variable has also been updated
            $exercise = $form->getData();

            $this->eventStore->addEvent('ExerciseCreated', [
                'exerciseId' => $exercise->getId(),
                'courseId' => $courseId,
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

        $exerciseHasSolutions = false;
        $phases = $exercise->getPhases();
        /* @var ExercisePhase $phase */
        foreach ($phases as $phase) {
            if (count($phase->getTeams()) > 0) {
                $exerciseHasSolutions = true;
                break;
            }
        }

        return $this->render('Exercise/Edit.html.twig', [
            'exercise' => $exercise,
            'exerciseHasSolutions' => $exerciseHasSolutions,
            'form' => $form->createView()
        ]);
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
        $courseId = $exercise->getCourse()->getId();

        $this->eventStore->addEvent('ExerciseDeleted', [
            'exerciseId' => $exercise->getId(),
            'courseId' => $courseId,
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($exercise);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercise.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview--show-course', ['id' => $courseId]);
    }
}
