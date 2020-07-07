<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\SolutionRepository")
 */
class Solution
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="json")
     */
    private $solution = [];

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Exercise\ExercisePhaseTeam", mappedBy="solution")
     */
    private $team;

    /**
     * Solution constructor.
     */
    public function __construct(string $id = null)
    {
        $solutionPrototype = [
            'annotations' => []
        ];
        $this->solution = $solutionPrototype;
        $this->generateOrSetId($id);
    }


    public function getSolution(): ?array
    {
        return $this->solution;
    }

    public function setSolution(array $solution): self
    {
        $this->solution = $solution;

        return $this;
    }

    public function getTeam(): ?ExercisePhaseTeam
    {
        return $this->team;
    }

    public function setTeam(?ExercisePhaseTeam $team): self
    {
        $this->team = $team;

        // set (or unset) the owning side of the relation if necessary
        $newSolution = null === $team ? null : $this;
        if ($team->getSolution() !== $newSolution) {
            $team->setSolution($newSolution);
        }

        return $this;
    }
}
