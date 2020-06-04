<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource(paginationEnabled=false)
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseTeamRepository")
 */
class ExercisePhaseTeam
{
    use IdentityTrait;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Exercise\ExercisePhase", inversedBy="teams")
     * @ORM\JoinColumn(nullable=false)
     */
    private $exercisePhase;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Exercise\Solution", inversedBy="team", cascade={"all"})
     */
    private $solution;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Account\User")
     */
    private $members;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User")
     */
    private $currentEditor;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\AutosavedSolution", mappedBy="team", orphanRemoval=true)
     */
    private $autosavedSolutions;

    public function __construct(?string $id = null)
    {
        $this->members = new ArrayCollection();
        $this->autosavedSolutions = new ArrayCollection();
        $this->generateOrSetId($id);
    }

    public function getExercisePhase(): ?ExercisePhase
    {
        return $this->exercisePhase;
    }

    public function setExercisePhase(?ExercisePhase $exercisePhase): self
    {
        $this->exercisePhase = $exercisePhase;

        return $this;
    }

    public function getSolution(): ?Solution
    {
        return $this->solution;
    }

    public function setSolution(?Solution $solution): self
    {
        $this->solution = $solution;

        return $this;
    }

    /**
     * @return Collection|User[]
     */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function addMember(User $member): self
    {
        if (!$this->members->contains($member)) {
            $this->members[] = $member;
        }

        return $this;
    }

    public function removeMember(User $member): self
    {
        if ($this->members->contains($member)) {
            $this->members->removeElement($member);
        }

        return $this;
    }

    public function getCurrentEditor(): ?User
    {
        return $this->currentEditor;
    }

    public function setCurrentEditor(?User $currentEditor): self
    {
        $this->currentEditor = $currentEditor;

        return $this;
    }

    /**
     * @return Collection|AutosavedSolution[]
     */
    public function getAutosavedSolutions(): Collection
    {
        return $this->autosavedSolutions;
    }

    public function addAutosavedSolution(AutosavedSolution $autosavedSolution): self
    {
        if (!$this->autosavedSolutions->contains($autosavedSolution)) {
            $this->autosavedSolutions[] = $autosavedSolution;
            $autosavedSolution->setTeam($this);
        }

        return $this;
    }

    public function removeAutosavedSolution(AutosavedSolution $autosavedSolution): self
    {
        if ($this->autosavedSolutions->contains($autosavedSolution)) {
            $this->autosavedSolutions->removeElement($autosavedSolution);
            // set the owning side to null (unless already changed)
            if ($autosavedSolution->getTeam() === $this) {
                $autosavedSolution->setTeam(null);
            }
        }

        return $this;
    }
}
