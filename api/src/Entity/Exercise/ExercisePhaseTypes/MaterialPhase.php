<?php

namespace App\Entity\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class MaterialPhase extends ExercisePhase
{
    const type = ExercisePhaseType::MATERIAL;

    const PHASE_COMPONENTS = [ ];

    const PHASE_COMPONENTS_GROUP = [ ];

    /**
     * @ORM\Column(name="material", type="text")
     */
    private string | null $material = '';


    public function __construct(string $id = null)
    {
        parent::__construct($id);
    }

    /**
     * @return array
     */
    public function getAllowedComponents(): array
    {
        if ($this->isGroupPhase()) {
            return array_merge(self::PHASE_COMPONENTS, self::PHASE_COMPONENTS_GROUP);
        } else {
            return self::PHASE_COMPONENTS;
        }
    }

    public function getMaterial(): string
    {
        return $this->material;
    }

    public function setMaterial(string $material)
    {
        $this->material = $material;
    }
}

