<?php

namespace App\Schreibtisch\Controller;

use App\Entity\Material\Material;
use App\Entity\Video\Video;
use App\Mediathek\Service\VideoFavouritesService;
use App\Schreibtisch\Service\SchreibtischService;
use App\Service\UserMaterialService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpFoundation\Request;
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
    private UserMaterialService $materialService;

    public function __construct(
        SchreibtischService $schreibtischService,
        VideoFavouritesService $videoFavouritesService,
        UserMaterialService $materialService,
    ) {
        $this->schreibtischService = $schreibtischService;
        $this->videoFavouritesService = $videoFavouritesService;
        $this->materialService = $materialService;
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
     * @Route("/schreibtisch/material", name="schreibtisch-material-api")
     */
    public function getMaterial(): Response
    {
        $responseData = json_encode($this->schreibtischService->getMaterialResponse());

        return new Response($responseData, 200);
    }

    /**
     * @Route("/schreibtisch/material/update/{id}", name="schreibtisch-material-update")
     */
    public function updateMaterial(Request $request, Material $material): Response
    {
        if ($content = $request->getContent()) {
            $updatedContent = json_decode($content, true);
            $this->materialService->updateMaterial($material, $updatedContent['material']);
        }

        return new Response();
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

    /**
     * @Route("/schreibtisch/fachbereiche", name="schreibtisch-fachbereiche-api")
     * @return Response
     */
    public function getFachbereiche(): Response
    {
        $user = $this->getUser();
        $responseData = json_encode($this->schreibtischService->getFachbereicheResponse($user));

        return new Response($responseData, 200);
    }

    /**
     * @Route("/schreibtisch/courses", name="schreibtisch-courses-api")
     * @return Response
     */
    public function getCourses(): Response
    {
        $user = $this->getUser();
        $responseData = json_encode($this->schreibtischService->getCoursesResponse($user));

        return new Response($responseData, 200);
    }
}
