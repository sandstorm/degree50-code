<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\Material;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\MaterialRepository;
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
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class MaterialController extends AbstractController
{
    private TranslatorInterface $translator;
    private KernelInterface $kernel;
    private DoctrineIntegratedEventStore $eventStore;
    private MaterialRepository $materialRepository;

    public function __construct(
        TranslatorInterface $translator,
        KernelInterface $kernel,
        DoctrineIntegratedEventStore $eventStore,
        MaterialRepository $materialRepository
    )
    {
        $this->translator = $translator;
        $this->kernel = $kernel;
        $this->eventStore = $eventStore;
        $this->materialRepository = $materialRepository;
    }

    /**
     * @Route("/material/download/{id}", name="exercise-overview__material--download")
     */
    public function download(AppRuntime $appRuntime, Material $material): BinaryFileResponse
    {
        $fileUrl = $appRuntime->virtualizedFileUrl($material->getUploadedFile());
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';
        $response = new BinaryFileResponse($publicResourcesFolderPath . $fileUrl);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $material->getName()
        );
        return $response;
    }

    /**
     * @Route("/material/delete/{id}", name="exercise-overview__material--delete")
     */
    public function delete(AppRuntime $appRuntime, Material $material): Response
    {
        $this->removeMaterial($appRuntime, $material);

        $this->addFlash(
            'success',
            $this->translator->trans('material.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $material->getExercisePhase()->getBelongsToExercise()->getId(), 'phase_id' => $material->getExercisePhase()->getId()]);
    }

    /**
     * @Route("/material/delete-ajax", name="exercise-overview__material--delete-ajax")
     */
    public function deleteAjax(AppRuntime $appRuntime, Request $request): Response
    {
        $materialIdFromJson = json_decode($request->getContent(), true)['materialId'];
        $material = $this->materialRepository->find($materialIdFromJson);

        /** @var User $user */
        $user = $this->getUser();

        if ($material->getCreator() !== $user) {
            return Response::create('NOT CREATOR', Response::HTTP_FORBIDDEN);
        }

        $this->removeMaterial($appRuntime, $material);

        return Response::create('OK');
    }

    private function removeMaterial(AppRuntime $appRuntime, Material $material): void
    {
        $fileUrl = $appRuntime->virtualizedFileUrl($material->getUploadedFile());
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';

        $filesystem = new Filesystem();
        $filesystem->remove($publicResourcesFolderPath . $fileUrl);

        $this->eventStore->addEvent('MaterialDeleted', [
            'materialId' => $material->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($material);
        $entityManager->flush();
    }

    /**
     * @Route("/material/list/{id}", name="exercise-overview__material--list")
     */
    public function uploadedMaterial(ExercisePhase $exercisePhase): Response
    {
        return $this->render('ExercisePhase/MaterialList.html.twig', [
            'materialList' => $exercisePhase->getMaterial()
        ]);
    }
}
