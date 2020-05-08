<?php

namespace App\VideoEncoding\Message;


class WebEncodingTask
{

    private string $inputVideoFilename;

    public function __construct(string $inputVideoFilename)
    {
        $this->inputVideoFilename = $inputVideoFilename;
    }

    public function getInputVideoFilename(): string
    {
        return $this->inputVideoFilename;
    }

}
