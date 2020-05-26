<?php

namespace App\Controller\Exercise;

use App\Admin\Form\ExerciseType;
use App\Entity\Exercise\Exercise;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExerciseRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_USER")
 */
class ExerciseController extends AbstractController
{
    private CourseRepository $courseRepository;
    private ExerciseRepository $exerciseRepository;

    /**
     * @param CourseRepository $courseRepository
     * @param ExerciseRepository $exerciseRepository
     */
    public function __construct(CourseRepository $courseRepository, ExerciseRepository $exerciseRepository)
    {
        $this->courseRepository = $courseRepository;
        $this->exerciseRepository = $exerciseRepository;
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
        $course = $this->courseRepository->find($courseId);

        $exercise = new Exercise();
        $exercise->setCourse($course);
        $form = $this->createForm(ExerciseType::class, $exercise);

        return $this->render('Exercise/New.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
