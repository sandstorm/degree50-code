<?php

namespace App\Mediathek\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Mediathek\Service\VideoFavouritesService;
use App\Repository\Account\CourseRepository;
use App\Repository\Video\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;

/**
 * @IsGranted("ROLE_USER")
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class MediathekOverviewController extends AbstractController
{

    public function __construct(
        private readonly VideoRepository        $videoRepository,
        private readonly CourseRepository       $courseRepository,
        private readonly VideoFavouritesService $videoFavouritesService,
        private readonly Security               $security,
        private readonly EntityManagerInterface $entityManager,
    )
    {
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
     * @IsGranted("favor", subject="video")
     * @Route("/mediathek/favor/{id?}", name="mediathek__video--favor")
     */
    public function toggleFavorVideo(Video $video): Response
    {
        /** @var User $user */
        $user = $this->security->getUser();

        $this->videoFavouritesService->toggleFavorite($video, $user);

        return $this->redirectToRoute('mediathek--index');
    }

    /**
     * @param Video[] $otherVideos
     * @return array[]
     */
    private function getVideosGrouped(array $otherVideos): array
    {
        /** @var User $user */
        $user = $this->security->getUser();

        $groupedVideosBuilder = new GroupedVideosBuilder($this->videoFavouritesService, $user);
        $groupedVideosBuilder->setUser($user);

        // we need all the videos, also the private ones that dont belong to any course
        $this->entityManager->getFilters()->disable('video_doctrine_filter');

        $ownVideos = $this->videoRepository->findByCreatorWithoutCutVideos($user);

        foreach ($ownVideos as $_key => $ownVideo) {
            $groupedVideosBuilder->addOwnVideo($ownVideo);
        }

        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        foreach ($otherVideos as $video) {
            if ($video->getCreator() !== $user) {
                $groupedVideosBuilder->addOtherVideo($video);
            }
        }

        return $groupedVideosBuilder->create();
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

        return $sidebarItems;
    }
}
