<?php

namespace App\Mediathek\Controller;

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
     * @Route("/mediathek", name="app_mediathek-index")
     */
    public function index(): Response
    {
        return $this->render('Mediathek/Index.html.twig', [
            'sidebarItems' => [],
            'videos' => $this->videoRepository->findAll()
        ]);
    }
}
