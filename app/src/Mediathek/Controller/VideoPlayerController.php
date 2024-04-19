<?php

namespace App\Mediathek\Controller;

use App\Domain\Video\Model\Video;
use App\Twig\AppRuntime;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted("ROLE_USER")]
 #[isGranted("user-verified")]
 #[IsGranted("data-privacy-accepted")]
 #[IsGranted("terms-of-use-accepted")]
class VideoPlayerController extends AbstractController
{
    public function __construct(private readonly AppRuntime $appRuntime)
    {
    }

    #[IsGranted("view", subject: "video")]
    #[Route("/video/play/{id}", name: "mediathek__video--player")]
    public function videoPlayer(Video $video): Response
    {
        return $this->render('Mediathek/VideoUpload/VideoPlayer.html.twig', [
            'video' => $video,
            'videoMap' => $video->getAsClientSideVideo($this->appRuntime)
        ]);
    }
}
