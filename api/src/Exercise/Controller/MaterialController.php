<?php

namespace App\Exercise\Controller;

use App\Entity\Exercise\Material;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Vich\UploaderBundle\Entity\File;
use Vich\UploaderBundle\Handler\DownloadHandler;

/**
 * @IsGranted("ROLE_USER")
 */
class MaterialController extends AbstractController
{
    private TranslatorInterface $translator;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @Route("/material/download/{id}", name="exercise-overview__material--download")
     */
    public function downloadAction(DownloadHandler $downloadHandler, Material $material): Response
    {
        // TODO can be used to rename files or check access
        return $downloadHandler->downloadObject($material, 'file', Material::class, true);
    }
}
