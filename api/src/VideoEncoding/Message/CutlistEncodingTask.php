<?php

namespace App\VideoEncoding\Message;

use App\Entity\Exercise\ExercisePhaseTeam;

class CutlistEncodingTask
{

    private string $videoId;
    private ExercisePhaseTeam $exercisePhaseTeam;

    public function __construct(ExercisePhaseTeam $exercisePhaseTeam, string $videoId)
    {
        $this->exercisePhaseTeam = $exercisePhaseTeam;
        $this->videoId = $videoId;
    }

     /**
      * Get exercisePhaseTeam.
      *
      * @return exercisePhaseTeam.
      */
     public function getExercisePhaseTeam(): ExercisePhaseTeam
     {
         return $this->exercisePhaseTeam;
     }

    /**
     * Get video.
     *
     * @return video.
     */
    public function getVideoId()
    {
        return $this->videoId;
    }
}
