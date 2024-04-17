<?php

namespace App\Domain\Exercise\ExercisePhaseTypes;

use App\Domain\Exercise\ExercisePhase;
use App\Domain\Exercise\ExercisePhase\ExercisePhaseType;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class ReflexionPhase extends ExercisePhase
{
    const type = ExercisePhaseType::REFLEXION;

    public function __construct(string $id = null)
    {
        parent::__construct($id);

        // ReflexionPhase is always a group phase
        $this->setIsGroupPhase(true);
    }
}
