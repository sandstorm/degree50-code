<?php

namespace App\DataExport\Controller\Dto;

/**
 * This is just a simple in memory text file representation.
 * We currently mainly use this as a DTO between our
 * DegreeDataToCsvService and our DataExportController.
 */
final class TextFileDto
{
    private string $fileName;
    private string $contentString;

    public function __construct(string $fileName, string $contentString)
    {
        $this->fileName = $fileName;
        $this->contentString = $contentString;
    }

    public function getFileName(): string
    {
        return $this->fileName;
    }

    public function getContentString(): string
    {
        return $this->contentString;
    }
}
