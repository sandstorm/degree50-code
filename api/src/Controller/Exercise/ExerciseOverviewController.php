<?php

namespace App\Controller\Exercise;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Repository\Account\CourseRepository;
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

    /**
     * ExerciseOverviewController constructor.
     * @param CourseRepository $courseRepository
     */
    public function __construct(CourseRepository $courseRepository)
    {
        $this->courseRepository = $courseRepository;
    }

    /**
     * @Route("/exercise-overview/", name="app_exercise-overview")
     */
    public function index(): Response
    {
        /* @var $user User */
        $user = $this->getUser();
        $courses = $this->courseRepository->findAllByUser($user);

        $sidebarItems = [];
        /* @var $course Course */
        foreach($courses as $course) {
            $creationDateYear = $course->getCreationDateYear();
            if (!array_key_exists($creationDateYear, $sidebarItems)) {
                $sidebarItems[$creationDateYear] = ['label' => $creationDateYear, 'items' => []];
            }
            array_push($sidebarItems[$creationDateYear]['items'], $course->getName());
        }

        return $this->render('ExerciseOverview/Index.html.twig', [
            'sidebarItems' => $sidebarItems
        ]);
    }
}
