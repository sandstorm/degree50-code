<?php

namespace App\Entity\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class VideoCutPhase extends ExercisePhase
{
    const type = ExercisePhaseType::VIDEO_CUT;

    const PHASE_COMPONENTS_GROUP = [];

    public function __construct(string $id = null)
    {
        parent::__construct($id);
    }
}
