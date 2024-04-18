<?php

namespace App\VideoEncoding\Message;

class CutListEncodingTask
{
    public function __construct(
        private readonly string $exercisePhaseTeamId,
        private readonly string $videoId
    )
    {
    }

    public function getExercisePhaseTeamId(): string
    {
        return $this->exercisePhaseTeamId;
    }

    public function getVideoId(): string
    {
        return $this->videoId;
    }
}
