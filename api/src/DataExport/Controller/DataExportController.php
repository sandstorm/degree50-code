<?php

namespace App\DataExport\Controller;

use App\Entity\Account\Course;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use ZipArchive;

/**
 * // TODO: role ROLE_ADMIN/DOZENT or at least ROLE_USER?
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class DataExportController extends AbstractController
{
    private DegreeDataToCsvService $degreeDataToCsvService;
    private LoggerInterface $logger;

    public function __construct(
        DegreeDataToCsvService $exportDataCreationService,
        LoggerInterface $logger
    )
    {
        $this->logger = $logger;
        $this->degreeDataToCsvService = $exportDataCreationService;
    }

    /**
     * @IsGranted("exportCSV", subject="course")
     * @Route("/exercise-overview/{id}/export-csv", name="exercise-overview__course-export-csv")
     */
    public function exportData(Request $request, Course $course): Response
    {
        $csvList = $this->degreeDataToCsvService->getAllAsVirtualCSVs($course);

        // Create temporary zip file
        $zipName = 'course_' . $course->getId() . '_csv-export.zip';
        $zipPath = sys_get_temp_dir() . '/' . Uuid::uuid4() . '_' . $zipName;

        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE);
        foreach ($csvList as $csvDto) {
            $zip->addFromString($csvDto->getFileName(), $csvDto->getContentString());
        }
        $zip->close();

        $response = new Response(file_get_contents($zipPath));
        $response->headers->set('Content-Type', 'application/zip');
        $response->headers->set('Content-Disposition', 'attachment;filename="' . $zipName . '"');
        $response->headers->set('Content-length', filesize($zipPath));

        // Remove zip file from file system
        unlink($zipPath);

        return $response;
    }
}
