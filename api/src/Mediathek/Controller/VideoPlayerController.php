<?php


namespace App\Mediathek\Controller;


use App\Entity\Video;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class VideoPlayerController extends AbstractController
{
    /**
     * @Route("/video/play/{id}", name="app_videoplayer")
     */
    public function videoPlayer(Video $video): Response
    {
        return $this->render('mediathek/videoUpload/videoPlayer.html.twig', [
            'video' => $video,
        ]);
    }
}
