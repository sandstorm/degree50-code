<?php

namespace App\Domain\ExercisePhase\Model;

use App\Domain\ExercisePhase\Repository\ExercisePhaseRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExercisePhaseRepository::class)]
class VideoCutPhase extends ExercisePhase
{
    const ?ExercisePhaseType type = ExercisePhaseType::VIDEO_CUT;

    const array PHASE_COMPONENTS_GROUP = [];

    public function __construct(string $id = null)
    {
        parent::__construct($id);
    }
}
