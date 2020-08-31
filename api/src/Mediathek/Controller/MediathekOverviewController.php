<?php

namespace App\Mediathek\Controller;

use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Repository\Video\VideoRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 */
class MediathekOverviewController extends AbstractController
{
    private VideoRepository $videoRepository;

    /**
     * @param VideoRepository $videoRepository
     */
    public function __construct(VideoRepository $videoRepository)
    {
        $this->videoRepository = $videoRepository;
    }


    /**
     * @Route("/mediathek", name="mediathek--index")
     */
    public function index(): Response
    {
        return $this->render('Mediathek/Index.html.twig', [
            'sidebarItems' => [],
            'groupedVideos' => $this->getVideosGrouped($this->videoRepository->findAll())
        ]);
    }

    private function getVideosGrouped(array $videos): array
    {
        $ownVideos = [
            'id' => 'ownVideos',
            'videos' => []
        ];
        $otherVideos = [
            'id' => 'otherVideos',
            'videos' => []
        ];

        /* @var User $user */
        $user = $this->getUser();

        /* @var $video Video */
        foreach ($videos as $video) {
            if ($video->getCreator() === $user) {
                array_push($ownVideos['videos'], $video);
            } else {
                array_push($otherVideos['videos'], $video);
            }
        }

        return [
            $ownVideos,
            $otherVideos
        ];
    }
}
