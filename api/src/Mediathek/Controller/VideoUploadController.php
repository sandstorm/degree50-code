<?php


namespace App\Mediathek\Controller;


use Ramsey\Uuid\Uuid;
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
        return $this->render('mediathek/videoUpload/videoUpload.html.twig', [
            // we generate the desired UUID for the video entity server-side, to ensure the file
            // upload and the normal HTML form fit together properly.
            'uuid' => Uuid::uuid4()->toString()
        ]);
    }
}
