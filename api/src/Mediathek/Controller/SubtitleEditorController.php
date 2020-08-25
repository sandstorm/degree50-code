<?php


namespace App\Mediathek\Controller;


use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Video\Video;

/**
 * @IsGranted("ROLE_USER")
 */
class SubtitleEditorController extends AbstractController
{
    /**
     * @Route("/subtitles/edit/{id}", name="app_subtitle-editor")
     */
    public function subtitleEditor(Video $video): Response
    {
        return $this->render('Mediathek/SubtitleEditor/SubtitleEditor.html.twig', [
            'video' => $video
        ]);
    }
}
