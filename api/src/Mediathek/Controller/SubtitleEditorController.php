<?php


namespace App\Mediathek\Controller;


use App\Entity\Video;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class SubtitleEditorController extends AbstractController
{
    /**
     * @Route("/subtitle-editor", name="app_subtitle-editor")
     */
    public function subtitleEditor(): Response
    {
        return $this->render('Mediathek/SubtitleEditor/SubtitleEditor.html.twig');
    }
}
