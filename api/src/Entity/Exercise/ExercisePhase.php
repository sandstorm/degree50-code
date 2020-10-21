<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Video\Video;
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
 *     "videoAnalysisPhase" = "App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase",
 *     "videoCutPhase" = "App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase",
 * })
 */
class ExercisePhase implements ExerciseInterface
{
    use IdentityTrait;

    // types of phases
    const TYPE_VIDEO_ANALYSE = 'videoAnalysis';
    const TYPE_VIDEO_CUTTING = 'videoCutting';
    const PHASE_TYPES = [self::TYPE_VIDEO_ANALYSE, self::TYPE_VIDEO_CUTTING];

    // components for phases
    const VIDEO_PLAYER = 'videoPlayer';
    const DOCUMENT_UPLOAD = 'documentUpload';
    const CHAT = 'chat';
    const SHARED_DOCUMENT = 'sharedDocument';
    const VIDEO_CODE = 'videoCode';
    const VIDEO_CUTTING = 'videoCutting';
    const VIDEO_ANNOTATION = 'videoAnnotation';

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
    public $belongsToExercise;

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
     * @ORM\OrderBy({"uploadAt" = "DESC"})
     */
    private $material;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\VideoCode", mappedBy="exercisePhase", cascade={"persist", "remove"})
     * @ORM\OrderBy({"name" = "ASC"})
     */
    private $videoCodes;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Video\Video", inversedBy="exercisePhases")
     */
    private $videos;

    /**
     * @ORM\Column(type="boolean")
     */
    private $dependsOnPreviousPhase = false;

    /**
     * @ORM\Column(type="boolean")
     */
    private $otherSolutionsAreAccessible = false;

    public function __construct(string $id = null)
    {
        $this->generateOrSetId($id);
        $this->teams = new ArrayCollection();
        $this->material = new ArrayCollection();
        $this->videoCodes = new ArrayCollection();
        $this->videos = new ArrayCollection();
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
    public function getBelongsToExercise(): Exercise
    {
        return $this->belongsToExercise;
    }

    /**
     * @param Exercise $belongsToExercise
     */
    public function setBelongsToExercise(Exercise $belongsToExercise): void
    {
        $this->belongsToExercise = $belongsToExercise;
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
        }

        return $this;
    }

    public function removeVideoCode(VideoCode $videoCode): self
    {
        if ($this->videoCodes->contains($videoCode)) {
            $this->videoCodes->removeElement($videoCode);
        }

        return $this;
    }

    /**
     * @return Collection|Video[]
     */
    public function getVideos(): Collection
    {
        return $this->videos;
    }

    public function addVideo(Video $video): self
    {
        if (!$this->videos->contains($video)) {
            $this->videos[] = $video;
        }

        return $this;
    }

    public function removeVideo(Video $video): self
    {
        if ($this->videos->contains($video)) {
            $this->videos->removeElement($video);
        }

        return $this;
    }

    public function getDependsOnPreviousPhase(): ?bool
    {
        return $this->dependsOnPreviousPhase;
    }

    public function setDependsOnPreviousPhase(bool $dependsOnPreviousPhase): self
    {
        $this->dependsOnPreviousPhase = $dependsOnPreviousPhase;

        return $this;
    }

    public function getOtherSolutionsAreAccessible(): ?bool
    {
        return $this->otherSolutionsAreAccessible;
    }

    public function setOtherSolutionsAreAccessible(bool $otherSolutionsAreAccessible): self
    {
        $this->otherSolutionsAreAccessible = $otherSolutionsAreAccessible;

        return $this;
    }
}
