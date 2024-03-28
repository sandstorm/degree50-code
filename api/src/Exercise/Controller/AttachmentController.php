<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\Attachment;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\AttachmentRepository;
use App\Twig\AppRuntime;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class AttachmentController extends AbstractController
{
    private TranslatorInterface $translator;
    private KernelInterface $kernel;
    private DoctrineIntegratedEventStore $eventStore;
    private AttachmentRepository $attachmentRepository;

    public function __construct(
        TranslatorInterface $translator,
        KernelInterface $kernel,
        DoctrineIntegratedEventStore $eventStore,
        AttachmentRepository $attachmentRepository
    )
    {
        $this->translator = $translator;
        $this->kernel = $kernel;
        $this->eventStore = $eventStore;
        $this->attachmentRepository = $attachmentRepository;
    }

    /**
     * @Route("/attachment/download/{id}", name="exercise-overview__attachment--download")
     */
    public function download(AppRuntime $appRuntime, Attachment $attachment): BinaryFileResponse
    {
        $fileUrl = $appRuntime->virtualizedFileUrl($attachment->getUploadedFile());
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';
        $response = new BinaryFileResponse($publicResourcesFolderPath . $fileUrl);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $attachment->getName()
        );
        return $response;
    }

    /**
     * @Route("/attachment/delete/{id}", name="exercise-overview__attachment--delete")
     */
    public function delete(AppRuntime $appRuntime, Attachment $attachment): Response
    {
        $this->removeAttachment($appRuntime, $attachment);

        $this->addFlash(
            'success',
            $this->translator->trans('attachment.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-phase__edit', ['id' => $attachment->getExercisePhase()->getBelongsToExercise()->getId(), 'phase_id' => $attachment->getExercisePhase()->getId()]);
    }

    /**
     * @Route("/attachment/delete-ajax", name="exercise-overview__attachment--delete-ajax")
     */
    public function deleteAjax(AppRuntime $appRuntime, Request $request): Response
    {
        $attachmentIdFromJson = json_decode($request->getContent(), true)['attachmentId'];
        $attachment = $this->attachmentRepository->find($attachmentIdFromJson);

        /** @var User $user */
        $user = $this->getUser();

        if ($attachment->getCreator() !== $user) {
            return new Response('NOT CREATOR', Response::HTTP_FORBIDDEN);
        }

        $this->removeAttachment($appRuntime, $attachment);

        return new Response('OK');
    }

    private function removeAttachment(AppRuntime $appRuntime, Attachment $attachment): void
    {
        $fileUrl = $appRuntime->virtualizedFileUrl($attachment->getUploadedFile());
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';

        $filesystem = new Filesystem();
        $filesystem->remove($publicResourcesFolderPath . $fileUrl);

        $this->eventStore->addEvent('AttachmentDeleted', [
            'attachmentId' => $attachment->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($attachment);
        $entityManager->flush();
    }

    /**
     * @Route("/attachment/list/{id}", name="exercise-overview__attachment--list")
     */
    public function uploadedAttachment(ExercisePhase $exercisePhase): Response
    {
        return $this->render('ExercisePhase/AttachmentList.html.twig', [
            'attachmentList' => $exercisePhase->getAttachment()
        ]);
    }
}
