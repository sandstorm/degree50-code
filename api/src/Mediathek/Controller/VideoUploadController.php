<?php


namespace App\Mediathek\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class VideoUploadController extends AbstractController
{
    /**
     * @Route("/video/uploads", name="app_videoupload")
     */
    public function videoUpload(): Response
    {
        return $this->render('mediathek/videoUpload/videoUpload.html.twig');
    }


}
