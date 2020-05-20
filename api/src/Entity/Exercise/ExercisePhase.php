<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * This is a dummy entity. Remove it!
 *
 * @ApiResource(paginationEnabled=false)
 * @ORM\Entity
 */
class ExercisePhase
{
    /**
     * @var string The entity Id
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="UUID")
     * @ORM\Column(type="guid")
     */
    private ?string $id;

    /**
     * @var string A nice person
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    public $name = '';

    /**
     * @var string Aufgabenstellung
     *
     * @ORM\Column(type="text")
     * @Assert\NotBlank
     */
    public $task = '';

    /**
     * @var string
     * @ORM\Column(type="text")
     * @Assert\NotBlank
     */
    public $definition = '';

    /**
     * @var Exercise
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="phases")
     */
    public $belongsToExcercise;

    /**
     * @var int
     * @ORM\Column
     */
    public $sorting;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\ExercisePhaseTeam", mappedBy="exercisePhase", cascade={"all"})
     */
    private $teams;

    public function __construct(string $id = null)
    {
        $this->id = $id;
        $this->teams = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function __toString()
    {
        return $this->name;
    }

    /**
     * @return Collection|ExercisePhaseTeam[]
     */
    public function getTeams(): Collection
    {
        return $this->teams;
    }

    public function addTeam(ExercisePhaseTeam $team): self
    {
        if (!$this->teams->contains($team)) {
            $this->teams[] = $team;
            $team->setExercisePhase($this);
        }

        return $this;
    }

    public function removeTeam(ExercisePhaseTeam $team): self
    {
        if ($this->teams->contains($team)) {
            $this->teams->removeElement($team);
            // set the owning side to null (unless already changed)
            if ($team->getExercisePhase() === $this) {
                $team->setExercisePhase(null);
            }
        }

        return $this;
    }
}
