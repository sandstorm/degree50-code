<?php

namespace App\VideoEncoding\Message;


use App\Entity\VirtualizedFile;

class WebEncodingTask
{

    private string $videoId;

    private VirtualizedFile $desiredOutputDirectory;

    public function __construct(string $videoId, VirtualizedFile $desiredOutputDirectory)
    {
        $this->videoId = $videoId;
        $this->desiredOutputDirectory = $desiredOutputDirectory;
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
