<?php

namespace App\VideoEncoding\Message;


class WebEncodingTask
{

    private string $inputVideoFilename;
    private string $outputDirectory;

    public function __construct(string $inputVideoFilename, string $outputDirectory)
    {
        $this->inputVideoFilename = $inputVideoFilename;
        $this->outputDirectory = $outputDirectory;
    }


    public function getInputVideoFilename(): string
    {
        return $this->inputVideoFilename;
    }

    public function getOutputDirectory(): string
    {
        return $this->outputDirectory;
    }



}
