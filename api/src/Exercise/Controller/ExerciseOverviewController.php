<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExerciseRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * This controller is responsible for actions regarding the exercise overview
 *
 * Exercises are being displayed as tiles on the templates.
 * NOTE: This has nothing to do with the overview of a single exercise.
 * Single exercise overview handling is located inside the [ExerciseController]
 *
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
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
     * @Route("/", name="app")
     */
    public function index(): Response
    {
        return $this->redirectToRoute('exercise-overview');
    }

    /**
     * @Route("/exercise-overview/{id?}", name="exercise-overview")
     */
    public function overview(Request $request, Course $course = null): Response
    {
        $statusFilter = $request->query->get('status');

        $queryCriteria = [];
        if ($course) {
            $queryCriteria['course'] = $course;
        }

        if ($statusFilter != null) {
            $queryCriteria['status'] = intval($statusFilter);
        }

        $groupedExercises = $this->getExercisesGrouped($this->exerciseRepository->findBy($queryCriteria, array('createdAt' => 'DESC')));

        return $this->render('ExerciseOverview/Index.html.twig', [
            'sidebarItems' => $this->getSideBarItems(),
            'course' => $course,
            'courseId' => $course ? $course->getId() : null,
            'activeFilter' => $statusFilter,
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

        /** @var User $user */
        $user = $this->getUser();

        /** @var $exercise Exercise */
        foreach ($exercises as $exercise) {
            if ($exercise->getCreator() === $user) {
                array_push($ownExercises['exercises'], $exercise);
            } else {
                array_push($otherExercises['exercises'], $exercise);
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
        foreach ($courses as $course) {
            $creationDateYear = $course->getCreationDateYear();
            if (!array_key_exists($creationDateYear, $sidebarItems)) {
                $sidebarItems[$creationDateYear] = ['label' => $creationDateYear, 'courses' => []];
            }
            array_push($sidebarItems[$creationDateYear]['courses'], $course);
        }

        // WHY: We want to sort the years DESC in the sidebar
        // ! mutation !
        krsort($sidebarItems, SORT_NUMERIC);

        return $sidebarItems;
    }
}
