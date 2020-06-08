<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExerciseType;
use App\Entity\Exercise\Exercise;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExerciseRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExerciseController extends AbstractController
{
    private CourseRepository $courseRepository;
    private ExerciseRepository $exerciseRepository;
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * @param CourseRepository $courseRepository
     * @param ExerciseRepository $exerciseRepository
     * @param TranslatorInterface $translator
     */
    public function __construct(CourseRepository $courseRepository, ExerciseRepository $exerciseRepository, TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore)
    {
        $this->courseRepository = $courseRepository;
        $this->exerciseRepository = $exerciseRepository;
        $this->translator = $translator;
        $this->eventStore = $eventStore;
    }
    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/show/{id}/{phase<\d+>}", name="app_exercise")
     */
    public function show(Exercise $exercise, int $phase = 0): Response
    {
        return $this->render('Exercise/Show.html.twig',
            [
                'exercise' => $exercise,
                'phase' => $exercise->getPhases()->get($phase),
                'currentPhase' => $phase,
                'amountOfPhases' => count($exercise->getPhases()) - 1
            ]);
    }

    /**
     * @Route("/exercise/new", name="app_exercise-new")
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

            return $this->redirectToRoute('app_exercise-edit', ['id' => $exercise->getId()]);
        }

        return $this->render('Exercise/New.html.twig', [
            'course' => $course,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}", name="app_exercise-edit")
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

            return $this->redirectToRoute('app_exercise-edit', ['id' => $exercise->getId()]);
        }

        return $this->render('Exercise/Edit.html.twig', [
            'exercise' => $exercise,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("delete", subject="exercise")
     * @Route("/exercise/delete/{id}", name="app_exercise-delete")
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

        return $this->redirectToRoute('app_exercise-overview-show-course', ['id' => $courseId]);
    }
}
