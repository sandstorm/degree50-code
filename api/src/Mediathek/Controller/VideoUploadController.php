<?php


namespace App\Mediathek\Controller;


use App\Entity\Video;
use App\Mediathek\Form\VideoType;
use App\Repository\VideoRepository;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class VideoUploadController extends AbstractController
{
    /**
     * @Route("/video/uploads/{videoUuid}", name="app_videoupload")
     */
    public function videoUpload(VideoRepository $videoRepository, Request $request, string $videoUuid = null): Response
    {
        if (!$videoUuid) {
            $videoUuid = Uuid::uuid4()->toString();
        }

        $video = $videoRepository->find($videoUuid);
        if (!$video) {
            $video = new Video($videoUuid);
        }

        $form = $this->createForm(VideoType::class, $video, [
            'action' => $this->generateUrl('app_videoupload', ['videoUuid' => $videoUuid])
        ]);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $video = $form->getData();
            assert($video instanceof Video);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($video);
            $entityManager->flush();

            return $this->redirectToRoute('app_videoplayer', ['id' => $video->getId()]);
        }

        return $this->render('mediathek/videoUpload/videoUpload.html.twig', [
            // we generate the desired UUID for the video entity server-side, to ensure the file
            // upload and the normal HTML form fit together properly.
            'uuid' => $videoUuid,
            'form' => $form->createView()
        ]);
    }
}
