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

    /**
     * @orm\column(name="material", type="text")
     */
    private string | null $material = '';

    /**
     * @orm\column(name="reviewRequired", type="boolean")
     */
    private bool | null $reviewRequired = false;


    public function __construct(string $id = null)
    {
        parent::__construct($id);
    }

    public function getMaterial(): string
    {
        return $this->material;
    }

    public function setMaterial(string $material)
    {
        $this->material = $material;
    }

    public function getReviewRequired(): bool
    {
        if (is_null($this->reviewRequired)) {
            return false;
        }

        return $this->reviewRequired;
    }

    public function setReviewRequired(bool $reviewRequired)
    {
        $this->reviewRequired = $reviewRequired;
    }
}
