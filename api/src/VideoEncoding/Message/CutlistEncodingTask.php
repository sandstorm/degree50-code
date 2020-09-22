<?php

namespace App\VideoEncoding\Message;

use App\Entity\Exercise\ExercisePhaseTeam;

class CutlistEncodingTask
{

    private string $videoId;
    private string $exercisePhaseTeamId;

    public function __construct(string $exercisePhaseTeamId, string $videoId)
    {
        $this->exercisePhaseTeamId = $exercisePhaseTeamId;
        $this->videoId = $videoId;
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
