<?php

namespace App\Controller\Exercise;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExerciseRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

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
     * @Route("/exercise-overview/", name="app_exercise-overview")
     */
    public function index(): Response
    {
        return $this->render('ExerciseOverview/Index.html.twig', [
            'sidebarItems' => $this->getSideBarItems(),
            'exercises' => $this->exerciseRepository->findAll(),
        ]);
    }

    /**
     * @Route("/exercise-overview/{id}", name="app_exercise-overview-show-course")
     */
    public function showExercisesForCourse(Course $course): Response
    {
        return $this->render('ExerciseOverview/ShowExercisesForCourse.html.twig', [
            'sidebarItems' => $this->getSideBarItems(),
            'course' => $course
        ]);
    }

    /**
     * @return array
     */
    private function getSideBarItems(): array
    {
        $courses = $this->courseRepository->findAll();

        $sidebarItems = [];
        /* @var $course Course */
        foreach($courses as $course) {
            $creationDateYear = $course->getCreationDateYear();
            if (!array_key_exists($creationDateYear, $sidebarItems)) {
                $sidebarItems[$creationDateYear] = ['label' => $creationDateYear, 'courses' => []];
            }
            array_push($sidebarItems[$creationDateYear]['courses'], $course);
        }

        return $sidebarItems;
    }
}
