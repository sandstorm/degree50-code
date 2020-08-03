<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Video\VideoCode;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\DiscriminatorColumn;
use Doctrine\ORM\Mapping\DiscriminatorMap;
use Doctrine\ORM\Mapping\InheritanceType;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ApiResource(paginationEnabled=false)
 * @ORM\Entity
 * @InheritanceType("SINGLE_TABLE")
 * @DiscriminatorColumn(name="phaseType", type="string")
 * @DiscriminatorMap({
 *     "exercisePhase" = "App\Entity\Exercise\ExercisePhase",
 *     "videoAnalysis" = "App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis"
 * })
 */
class ExercisePhase implements ExerciseInterface
{
    use IdentityTrait;

    // types of phases
    const TYPE_VIDEO_ANALYSE = 'videoAnalysis';
    const PHASE_TYPES = [self::TYPE_VIDEO_ANALYSE];

    // components for phases
    const VIDEO_PLAYER = 'videoPlayer';
    const DOCUMENT_UPLOAD = 'documentUpload';
    const VIDEO_CODE = 'videoCode';
    const VIDEO_CUTTING = 'videoCutting';
    const CHAT = 'chat';
    const SHARED_DOCUMENT = 'sharedDocument';

    /**
     * @var bool
     * @ORM\Column(type="boolean")
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

    /**
     * @var array|null
     *
     * @ORM\Column(type="simple_array", nullable=TRUE)
     */
    public $components = '';

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\Material", mappedBy="exercisePhase", cascade={"persist", "remove"})
     * @Assert\Valid()
     */
    private $material;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Video\VideoCode", inversedBy="exercisePhases")
     */
    private $videoCodes;

    public function __construct(string $id = null)
    {
        $this->generateOrSetId($id);
        $this->teams = new ArrayCollection();
        $this->material = new ArrayCollection();
        $this->videoCodes = new ArrayCollection();
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

    /**
     * Override in extending class
     *
     * @return string
     */
    public function getType(): string
    {
        return 'exercisePhase';
    }

    /**
     * @return array|null
     */
    public function getComponents(): ?array
    {
        return $this->components;
    }

    /**
     * @param array $components
     */
    public function setComponents(array $components): void
    {
        $this->components = $components;
    }

    /**
     * @param Material $material
     *
     * @return ExercisePhase
     */
    public function addMaterial(Material $material): self
    {
        $this->material->add($material);
        $material->setExercisePhase($this);
        return $this;
    }

    /**
     * @param Material $material
     */
    public function removeMaterial(Material $material): self
    {
        $this->material->removeElement($material);
    }

    /**
     * @return Collection
     */
    public function getMaterial(): Collection
    {
        return $this->material;
    }

    /**
     * @return Collection|VideoCode[]
     */
    public function getVideoCodes(): Collection
    {
        return $this->videoCodes;
    }

    public function addVideoCode(VideoCode $videoCode): self
    {
        if (!$this->videoCodes->contains($videoCode)) {
            $this->videoCodes[] = $videoCode;
            $videoCode->addExercisePhase($this);
        }

        return $this;
    }

    public function removeVideoCode(VideoCode $videoCode): self
    {
        if ($this->videoCodes->contains($videoCode)) {
            $this->videoCodes->removeElement($videoCode);
            $videoCode->removeExercisePhase($this);
        }

        return $this;
    }
}
