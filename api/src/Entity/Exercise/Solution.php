<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Video\Video;
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
     * @var \DateTimeImmutable|null
     *
     * @ORM\Column(type="datetimetz_immutable")
     */
    private $update_timestamp;

    /**
     * @ORM\OneToOne(targetEntity=Video::class, cascade={"persist", "remove"})
     */
    private $cutVideo;
    
    /**
     * Solution constructor.
     */
    public function __construct(string $id = null)
    {
        $solutionPrototype = [
            'annotations' => [],
            'videoCodes' => [],
            'cutlist' => [],
        ];
        $this->solution = $solutionPrototype;
        $this->generateOrSetId($id);
        $this->update_timestamp = new \DateTimeImmutable();
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

    /**
     * @return \DateTimeImmutable|null
     */
    public function getUpdateTimestamp(): ?\DateTimeImmutable
    {
        return $this->update_timestamp;
    }

    /**
     * @param \DateTimeImmutable|null $update_timestamp
     */
    public function setUpdateTimestamp(?\DateTimeImmutable $update_timestamp): void
    {
        $this->update_timestamp = $update_timestamp;
    }

    public function getCutVideo(): ?Video
    {
        return $this->cutVideo;
    }

    public function setCutVideo(?Video $cutVideo): self
    {
        $this->cutVideo = $cutVideo;

        return $this;
    }
}
