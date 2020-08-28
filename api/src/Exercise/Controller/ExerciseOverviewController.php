<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExerciseRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 */
class ExerciseOverviewController extends AbstractController
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
     * @Route("/", name="exercise-overview")
     */
    public function index(): Response
    {
        $groupedExercises = $this->getExercisesGrouped($this->exerciseRepository->findBy(array(), array('createdAt' => 'DESC')));

        return $this->render('ExerciseOverview/Index.html.twig', [
            'sidebarItems' => $this->getSideBarItems(),
            'groupedExercises' => $groupedExercises,
        ]);
    }

    /**
     * @Route("/exercise-overview/{id}", name="exercise-overview--show-course")
     */
    public function showExercisesForCourse(Course $course): Response
    {
        $groupedExercises = $this->getExercisesGrouped($this->exerciseRepository->findBy(array('course' => $course), array('createdAt' => 'DESC')));

        return $this->render('ExerciseOverview/ShowExercisesForCourse.html.twig', [
            'sidebarItems' => $this->getSideBarItems(),
            'course' => $course,
            'groupedExercises' => $groupedExercises,
        ]);
    }

    private function getExercisesGrouped(array $exercises): array
    {
        $ownExercises = [
            'id' => 'ownExercises',
            'exercises' => []
        ];
        $otherExercises = [
            'id' => 'otherExercises',
            'exercises' => []
        ];

        /* @var User $user */
        $user = $this->getUser();

        /* @var $exercise Exercise */
        foreach ($exercises as $exercise) {
            if ($exercise->getCreator() === $user) {
                array_push($ownExercises['exercises'], $exercise);
            } else {
                if ($exercise->getStatus() != Exercise::EXERCISE_CREATED) {
                    array_push($otherExercises['exercises'], $exercise);
                }
            }
        }

        return [
            $ownExercises,
            $otherExercises
        ];
    }

    /**
     * @return array
     */
    private function getSideBarItems(): array
    {
        $courses = $this->courseRepository->findAll();

        $sidebarItems = [];
        /* @var $course Course */
        foreach ($courses as $course) {
            $creationDateYear = $course->getCreationDateYear();
            if (!array_key_exists($creationDateYear, $sidebarItems)) {
                $sidebarItems[$creationDateYear] = ['label' => $creationDateYear, 'courses' => []];
            }
            array_push($sidebarItems[$creationDateYear]['courses'], $course);
        }

        return $sidebarItems;
    }
}
