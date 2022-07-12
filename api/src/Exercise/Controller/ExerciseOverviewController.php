<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Exercise\Controller\GroupedExercisesBuilder;
use App\Repository\Account\CourseRepository;
use App\Repository\Exercise\ExerciseRepository;
use ExerciseWithReviewStatusDto;
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
    private ExerciseService $exerciseService;

    /**
     * @param CourseRepository $courseRepository
     * @param ExerciseRepository $exerciseRepository
     */
    public function __construct(
        CourseRepository $courseRepository,
        ExerciseRepository $exerciseRepository,
        ExerciseService $exerciseService,
    ) {
        $this->courseRepository = $courseRepository;
        $this->exerciseRepository = $exerciseRepository;
        $this->exerciseService = $exerciseService;
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
            'courseId' => $course?->getId(),
            'activeFilter' => $statusFilter,
            'groupedExercises' => $groupedExercises,
        ]);
    }

    private function getExercisesGrouped(array $exercises): array
    {
        /** @var User $user */
        $user = $this->getUser();

        $groupedExercisesBuilder = new GroupedExercisesBuilder($this->exerciseService);

        foreach ($exercises as $_key => $exercise) {
            /** @var Exercise $exercise */
            if ($exercise->getCreator() === $user) {
                $groupedExercisesBuilder->addOwnExercise($exercise);
            } else {
                $groupedExercisesBuilder->addOtherExercise($exercise);
            }
        }

        return $groupedExercisesBuilder->create();
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
            $sidebarItems[$creationDateYear]['courses'][] = $course;
        }

        // WHY: We want to sort the years DESC in the sidebar
        // ! mutation !
        krsort($sidebarItems, SORT_NUMERIC);

        return $sidebarItems;
    }
}
