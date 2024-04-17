<?php

namespace App\VideoEncoding\Message;

class CutListEncodingTask
{

    public function __construct(
        private string $exercisePhaseTeamId,
        private string $videoId
    )
    {
    }

    /**
     * Get exercisePhaseTeam.
     *
     * @return string.
     */
    public function getExercisePhaseTeamId(): string
    {
        return $this->exercisePhaseTeamId;
    }

    /**
     * Get video.
     *
     * @return string
     */
    public function getVideoId(): string
    {
        return $this->videoId;
    }
}
