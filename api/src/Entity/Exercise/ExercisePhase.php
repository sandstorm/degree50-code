<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * This is a dummy entity. Remove it!
 *
 * @ApiResource(paginationEnabled=false)
 * @ORM\Entity
 */
class ExercisePhase
{
    const PHASE_TYPES = ['VIDEO_ANALYSE']; // TODO

    /**
     * @var string The entity Id
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="UUID")
     * @ORM\Column(type="guid")
     */
    private ?string $id;

    /**
     * @var bool
     * @ORM\Column
     */
    public $isGroupPhase = false;

    /**
     * @var string
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
     *
     * @ORM\Column
     * @Assert\NotBlank
     * @Assert\Choice(choices=ExercisePhase::PHASE_TYPES, message="Choose a valid type.")
     */
    public $type = '';

    /**
     * @var string
     * @ORM\Column(type="text")
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

    /**
     * @return Exercise
     */
    public function getBelongsToExcercise(): Exercise
    {
        return $this->belongsToExcercise;
    }

    /**
     * @param Exercise $belongsToExcercise
     */
    public function setBelongsToExcercise(Exercise $belongsToExcercise): void
    {
        $this->belongsToExcercise = $belongsToExcercise;
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getTypeLabel(): string
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType(string $type): void
    {
        $this->type = $type;
    }

    /**
     * @return int
     */
    public function getSorting(): int
    {
        return $this->sorting;
    }

    /**
     * @param int $sorting
     */
    public function setSorting(int $sorting): void
    {
        $this->sorting = $sorting;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name): void
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getTask(): string
    {
        return $this->task;
    }

    /**
     * @param string $task
     */
    public function setTask(string $task): void
    {
        $this->task = $task;
    }

    /**
     * @return bool
     */
    public function isGroupPhase(): bool
    {
        return $this->isGroupPhase;
    }

    /**
     * @param bool $isGroupPhase
     */
    public function setIsGroupPhase(bool $isGroupPhase): void
    {
        $this->isGroupPhase = $isGroupPhase;
    }

}
