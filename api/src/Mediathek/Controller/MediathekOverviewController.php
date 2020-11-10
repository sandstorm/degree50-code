<?php

namespace App\Mediathek\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Repository\Account\CourseRepository;
use App\Repository\Video\VideoRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 */
class MediathekOverviewController extends AbstractController
{
    private VideoRepository $videoRepository;
    private CourseRepository $courseRepository;

    /**
     * @param VideoRepository $videoRepository
     */
    public function __construct(VideoRepository $videoRepository, CourseRepository $courseRepository)
    {
        $this->videoRepository = $videoRepository;
        $this->courseRepository = $courseRepository;
    }

    /**
     * @Route("/mediathek/{id?}", name="mediathek--index")
     */
    public function index(Course $course = null): Response
    {
        if ($course) {
            $videos = $this->videoRepository->findByCourse($course);
        } else {
            $videos = $this->videoRepository->findBy(array(), array('createdAt' => 'DESC'));
        }

        return $this->render('Mediathek/Index.html.twig', [
            'sidebarItems' => $this->getSideBarItems(),
            'course' => $course,
            'groupedVideos' => $this->getVideosGrouped($videos)
        ]);
    }

    /**
     * @param array $videos
     * @return array[]
     */
    private function getVideosGrouped(array $videos): array
    {
        /* @var User $user */
        $user = $this->getUser();

        // we need all the videos, also the private ones that dont belong to any course
        if ($this->getDoctrine()->getManager()->getFilters()->isEnabled('video_doctrine_filter')) {
            $this->getDoctrine()->getManager()->getFilters()->disable('video_doctrine_filter');
        }
        $ownVideos = [
            'id' => 'ownVideos',
            'videos' => $this->videoRepository->findByCreatorWithoutCutVideos($user)
        ];
        $this->getDoctrine()->getManager()->getFilters()->enable('video_doctrine_filter');

        $otherVideos = [
            'id' => 'otherVideos',
            'videos' => []
        ];

        /* @var $video Video */
        foreach ($videos as $video) {
            if ($video->getCreator() !== $user) {
                array_push($otherVideos['videos'], $video);
            }
        }

        return [
            $ownVideos,
            $otherVideos
        ];
    }

    /**
     * TODO currently copy paste from ExerciseOverviewController
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
