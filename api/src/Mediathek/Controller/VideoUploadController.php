<?php


namespace App\Mediathek\Controller;


use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Mediathek\Form\VideoType;
use App\Repository\Video\VideoRepository;
use App\Twig\AppRuntime;
use Ramsey\Uuid\Uuid;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class VideoUploadController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
    }

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

            $this->eventStore->addEvent('VideoNameAndDescriptionAdded', [
                'videoId' => $video->getId(),
                'title' => $video->getTitle(),
                'description' => $video->getDescription(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($video);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('video.upload.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('app_videoplayer', ['id' => $video->getId()]);
        }

        return $this->render('Mediathek/VideoUpload/VideoUpload.html.twig', [
            // we generate the desired UUID for the video entity server-side, to ensure the file
            // upload and the normal HTML form fit together properly.
            'uuid' => $videoUuid,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("edit", subject="video")
     * @Route("/video/edit/{id}", name="app_video-edit")
     */
    public function edit(Request $request, Video $video): Response
    {
        $form = $this->createForm(VideoType::class, $video);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $video = $form->getData();
            assert($video instanceof Video);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($video);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('video.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('app_mediathek-index');
        }

        return $this->render('Mediathek/VideoUpload/Edit.html.twig', [
            'video' => $video,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("delete", subject="video")
     * @Route("/video/delete/{id}", name="app_video-delete")
     */
    public function delete(AppRuntime $appRuntime, Video $video): Response
    {
        /* @var \App\Entity\VirtualizedFile $encodedDirectory */
        $encodedDirectory = $video->getEncodedVideoDirectory();
        // TODO remove file?
        // TODO check for usage of the video
        if ($video) {
            $this->eventStore->addEvent('VideoDeleted', [
                'videoId' => $video->getId(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->remove($video);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('video.delete.messages.success', [], 'forms')
            );
        }

        return $this->redirectToRoute('app_mediathek-index');
    }
}
