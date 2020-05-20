<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Entity\Account\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\AutosavedSolutionRepository")
 */
class AutosavedSolution
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="json")
     */
    private $solution = [];

    /**
     * @ORM\Column(type="datetimetz_immutable")
     */
    private $update_timestamp;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User")
     */
    private $owner;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Exercise\ExercisePhaseTeam", inversedBy="autosavedSolutions")
     * @ORM\JoinColumn(nullable=false)
     */
    private $team;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getUpdateTimestamp(): ?\DateTimeImmutable
    {
        return $this->update_timestamp;
    }

    public function setUpdateTimestamp(\DateTimeImmutable $update_timestamp): self
    {
        $this->update_timestamp = $update_timestamp;

        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): self
    {
        $this->owner = $owner;

        return $this;
    }

    public function getTeam(): ?ExercisePhaseTeam
    {
        return $this->team;
    }

    public function setTeam(?ExercisePhaseTeam $team): self
    {
        $this->team = $team;

        return $this;
    }
}
