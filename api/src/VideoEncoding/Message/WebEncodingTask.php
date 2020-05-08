<?php

namespace App\VideoEncoding\Message;


class WebEncodingTask
{

    private string $inputVideo;

    public function __construct(string $inputVideo)
    {
        $this->inputVideo = $inputVideo;
    }

    public function getInputVideo(): string
    {
        return $this->inputVideo;
    }

}
