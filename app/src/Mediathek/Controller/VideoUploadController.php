<?php

namespace App\Mediathek\Controller;

use App\Domain\Course\Model\Course;
use App\Domain\User\Model\User;
use App\Domain\Video\Model\Video;
use App\Domain\Video\Repository\VideoRepository;
use App\Domain\Video\Service\VideoService;
use App\Domain\VirtualizedFile\Model\VirtualizedFile;
use App\Mediathek\Form\MediathekVideoFormType;
use App\Twig\AppRuntime;
use App\VideoEncoding\Message\WebEncodingTask;
use App\VideoEncoding\MessageHandler\WebEncodingHandler;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Handles the upload of video, audio and subtitles files inside the mediathek.
 * The locations where the files are saved to are specified inside @see {oneup_flysystem.yaml}.
 *
 * As soon as the videos form data is being submitted, we dispatch a
 * @see {VideoEncoding\Message\WebEncodingTask}, which triggers the encoding of the
 * video file and outputs the result into the encoded_videos/ directory.
 *
 * The application then makes only use of the encoded_files, but not of the originally uploaded videos (these are deleted after the encoding completion).
 *
 * NOTE: The upload of the original files which are later encoded by the WebEncodingTask is handled by our UploadListener-Implementation
 * @see UploadListener
 *
 * @IsGranted("ROLE_USER")
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class VideoUploadController extends AbstractController
{
    public function __construct(
        private readonly TranslatorInterface          $translator,
        private readonly MessageBusInterface          $messageBus,
        private readonly VideoRepository              $videoRepository,
        private readonly VideoService                 $videoService,
        private readonly AppRuntime                   $appRuntime,
        private readonly EntityManagerInterface       $entityManager
    )
    {
    }

    /**
     * Either shows the video upload form or redirects to the mediathek if the form has been submitted.
     * After a successful submit a WebEncodingTask is being dispatched, so that the original video gets encoded.
     * @see WebEncodingHandler
     *
     * @IsGranted("create")
     * @Route("/video/uploads/{id?}", name="mediathek__video--upload")
     * @see WebEncodingTask
     */
    public function showVideoUploadForm(Request $request, Course $course = null): Response
    {
        $videoUuid = $request->query->get('videoUuid');

        if (!$videoUuid) {
            $videoUuid = Uuid::uuid4()->toString();
        }

        // we need to disable the video-filter here, cause the uploaded video has already created an video db entry
        // but without courses set. With the filter active we could not find the existing db entry at this point.
        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $video = $this->videoRepository->find($videoUuid);
        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        if (!$video) {
            $video = new Video($videoUuid);
        }

        /** @var User $user */
        $user = $this->getUser();
        $video->setCreator($user);
        if ($course) {
            $video->addCourse($course);
        }

        $form = $this->createForm(MediathekVideoFormType::class, $video, [
            'action' => $this->generateUrl('mediathek__video--upload', ['videoUuid' => $videoUuid])
        ]);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $video = $form->getData();
            assert($video instanceof Video);

            // dispatch event to start encoding when form is submitted
            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
            $this->messageBus->dispatch(new WebEncodingTask($video->getId(), $outputDirectory));

            $this->entityManager->persist($video);
            $this->entityManager->flush();

            $this->addFlash(
                'info',
                $this->translator->trans('video.upload.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('mediathek__video--player', ['id' => $video->getId()]);
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
     * @Route("/video/edit/{id}", name="mediathek__video--edit")
     */
    public function edit(Request $request, Video $video): Response
    {
        $form = $this->createForm(MediathekVideoFormType::class, $video);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $video = $form->getData();
            assert($video instanceof Video);

            $this->entityManager->persist($video);
            $this->entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('video.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('mediathek--index');
        }

        return $this->render('Mediathek/VideoUpload/Edit.html.twig', [
            'video' => $video,
            'videoMap' => $video->getAsClientSideVideo($this->appRuntime),
            'form' => $form->createView(),
        ]);
    }

    /**
     * TODO show delete page to confirm and show usage of the video on delete
     * Delete the video entity and the encoded video
     *
     * @IsGranted("delete", subject="video")
     * @Route("/video/delete/{id}/{confirm}", name="mediathek__video--delete")
     */
    public function delete(Video $video, bool $confirm = false): Response
    {
        if ($confirm) {
            $this->videoService->deleteVideo($video);
            $this->addFlash(
                'success',
                $this->translator->trans('video.delete.messages.success', [], 'forms')
            );
            return $this->redirectToRoute('mediathek--index');
        }

        return $this->render('Mediathek/VideoUpload/Delete.html.twig', [
            'video' => $video,
        ]);
    }

    /**
     * Triggered by VideoUploadController.js to remove newly uploaded videos
     *
     * @Route("/video/delete-ajax/{id}", name="mediathek__video--delete-ajax")
     */
    public function deleteAjax(Video $video): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($video->getCreator() !== $user) {
            return new Response('NOT CREATOR', Response::HTTP_FORBIDDEN);
        }

        $this->videoService->removeOriginalVideoFile($video);

        return new Response('OK');
    }

    /**
     * Triggered by VideoUploadController.js to remove newly uploaded subtitles
     *
     * @Route("/video/delete-subtitle-ajax/{id}", name="mediathek__subtitle--delete-ajax")
     */
    public function deleteSubtitleAjax(Video $video): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($video->getCreator() !== $user) {
            return new Response('NOT CREATOR', Response::HTTP_FORBIDDEN);
        }

        $this->videoService->removeOriginalSubtitleFile($video);

        return new Response('OK');
    }

    /**
     * Triggered by AudioDescriptionUploadController.js to remove newly uploaded audioDescriptions
     *
     * @Route("/video/delete-audio-description-ajax/{id}", name="mediathek__audio_description--delete-ajax")
     */
    public function deleteAudioDescriptionAjax(Video $video): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($video->getCreator() !== $user) {
            return new Response('NOT CREATOR', Response::HTTP_FORBIDDEN);
        }

        $this->videoService->removeOriginalAudioDescriptionFile($video);

        return new Response('OK');
    }
}
