<?php

namespace App\Domain\ExercisePhase;

use App\Domain\ExercisePhase;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Domain\ExercisePhase\Repository\ExercisePhaseRepository")
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
