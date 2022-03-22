<?php

namespace App\Entity\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class ReflexionPhase extends ExercisePhase
{
    const type = ExercisePhaseType::REFLEXION;

    /**
     * @deprecated
     */
    const PHASE_COMPONENTS = [];

    /**
     * @deprecated
     */
    const PHASE_COMPONENTS_GROUP = [];

    public function __construct(string $id = null)
    {
        parent::__construct($id);

        // Reflexionphase should always be a group phase
        $this->setIsGroupPhase(true);
    }

    /**
     * @return array
     * @deprecated
     */
    public function getAllowedComponents(): array
    {
        if ($this->isGroupPhase()) {
            return array_merge(self::PHASE_COMPONENTS, self::PHASE_COMPONENTS_GROUP);
        } else {
            return self::PHASE_COMPONENTS;
        }
    }
}
