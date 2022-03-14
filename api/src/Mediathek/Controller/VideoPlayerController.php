<?php


namespace App\Mediathek\Controller;


use App\Entity\Video\Video;
use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class VideoPlayerController extends AbstractController
{

    private AppRuntime $appRuntime;

    function __construct(AppRuntime $appRuntime)
    {
        $this->appRuntime = $appRuntime;
    }

    /**
     * @IsGranted("view", subject="video")
     * @Route("/video/play/{id}", name="mediathek__video--player")
     */
    public function videoPlayer(Video $video): Response
    {
        return $this->render('Mediathek/VideoUpload/VideoPlayer.html.twig', [
            'video' => $video,
            'videoMap' => $video->getAsArray($this->appRuntime)
        ]);
    }
}
