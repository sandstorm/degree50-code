<?php


namespace App\Mediathek\Controller;


use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 */
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
