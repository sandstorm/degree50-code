<?php

namespace App\VideoEncoding\Message;

use App\Entity\VirtualizedFile;

class WebEncodingTask
{

    public function __construct(
        private readonly string          $videoId,
        private readonly VirtualizedFile $desiredOutputDirectory
    )
    {
    }

    public function getVideoId(): string
    {
        return $this->videoId;
    }

    public function getDesiredOutputDirectory(): VirtualizedFile
    {
        return $this->desiredOutputDirectory;
    }


}
