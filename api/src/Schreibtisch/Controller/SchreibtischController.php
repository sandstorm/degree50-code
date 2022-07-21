<?php

namespace App\Schreibtisch\Controller;

use App\Entity\Video\Video;
use App\Mediathek\Service\VideoFavouritesService;
use App\Schreibtisch\Service\SchreibtischService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class SchreibtischController extends AbstractController
{
    private SchreibtischService $schreibtischService;
    private VideoFavouritesService $videoFavouritesService;

    public function __construct(
        SchreibtischService $schreibtischService,
        VideoFavouritesService $videoFavouritesService,
    ) {
        $this->schreibtischService = $schreibtischService;
        $this->videoFavouritesService = $videoFavouritesService;
    }

    /**
     * @Route("/schreibtisch", name="schreibtisch")
     */
    public function index(): Response
    {
        return $this->render('Schreibtisch/Index.html.twig', []);
    }

    /**
     * @Route("/schreibtisch/exercises", name="schreibtisch-exercises-api")
     */
    public function getExercises(): Response
    {
        $responseData = json_encode($this->schreibtischService->getExercisesApiResponse());

        return new Response($responseData, 200);
    }

    /**
     * @Route("/schreibtisch/video-favorites", name="schreibtisch-video-favorites-api")
     */
    public function getVideoFavorites(): Response
    {
        $responseData = json_encode($this->schreibtischService->getVideoFavoritesResponse());

        return new Response($responseData, 200);
    }

    /**
     * @Route("/schreibtisch/video-favorites/toggle/{id}", name="schreibtisch-video-favorite-toggle", methods={"POST"})
     * @Entity("video", expr="repository.find(id)")
     */
    public function toggleVideoFavorite(Video $video): Response
    {
        $user = $this->getUser();
        $this->videoFavouritesService->toggleFavorite($video, $user);

        return new Response();
    }
}
