<?php

namespace App\Domain\ExercisePhase;

use App\Domain\ExercisePhase;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Domain\ExercisePhase\Repository\ExercisePhaseRepository")
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
