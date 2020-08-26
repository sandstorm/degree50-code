<?php


namespace App\Mediathek\Controller;


use App\Entity\Video\Video;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 */
class VideoPlayerController extends AbstractController
{
    /**
     * @Route("/video/play/{id}", name="mediathek__video--player")
     */
    public function videoPlayer(Video $video): Response
    {
        return $this->render('Mediathek/VideoUpload/VideoPlayer.html.twig', [
            'video' => $video,
        ]);
    }
}
