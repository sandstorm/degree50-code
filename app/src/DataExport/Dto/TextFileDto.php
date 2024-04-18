<?php

namespace App\DataExport\Dto;

/**
 * This is just a simple in memory text file representation.
 * We currently mainly use this as a DTO between our
 * DegreeDataToCsvService and our DataExportController.
 */
final class TextFileDto
{
    public function __construct(
        private readonly string $fileName,
        private readonly string $contentString
    )
    {
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
