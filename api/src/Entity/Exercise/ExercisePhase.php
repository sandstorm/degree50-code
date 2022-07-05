<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Entity\Exercise\ExercisePhaseTypes\MaterialPhase;
use App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Video\Video;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\DiscriminatorColumn;
use Doctrine\ORM\Mapping\DiscriminatorMap;
use Doctrine\ORM\Mapping\InheritanceType;
use Doctrine\ORM\Mapping\JoinColumn;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Describes a single Phase of an exercise (e.g. a "Video-Analysis" or "Video-Cutting").
 * An exercisePhase might depend on a previous exercise if that is the case, the previous
 * phase is determined by the next lower sorting of the phases.
 *
 * If "otherSolutionsAreAccessible" it is possible for "studierende" to display the solutions
 * of other "studierende" for the phase.
 *
 * @ApiResource(paginationEnabled=false)
 * @ORM\Entity
 * @InheritanceType("SINGLE_TABLE")
 * @DiscriminatorColumn(name="phaseType", type="string")
 * @DiscriminatorMap({
 *     "videoAnalysisPhase" = "App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase",
 *     "videoCutPhase" = "App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase",
 *     "reflexionPhase" = "App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase",
 *     "materialPhase" = "App\Entity\Exercise\ExercisePhaseTypes\MaterialPhase",
 * })
 */
abstract class ExercisePhase
{
    use IdentityTrait;

    const type = null;

    // components for phases
    const VIDEO_PLAYER = 'videoPlayer';
    const DOCUMENT_UPLOAD = 'documentUpload';
    const CHAT = 'chat';
    const SHARED_DOCUMENT = 'sharedDocument';
    const VIDEO_CODE = 'videoCode';
    const VIDEO_CUTTING = 'videoCutting';
    const VIDEO_ANNOTATION = 'videoAnnotation';

    /**
     * @ORM\Column(type="boolean")
     */
    public bool $isGroupPhase = false;

    /**
     * @ORM\Column
     * @Assert\NotBlank
     */
    public string $name = '';

    /**
     * @ORM\Column(type="text")
     * @Assert\NotBlank
     */
    public string $task = '';

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="phases")
     */
    public Exercise $belongsToExercise;

    /**
     * @ORM\Column
     */
    public int $sorting;

    /**
     * @var ExercisePhaseTeam[]
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\ExercisePhaseTeam", mappedBy="exercisePhase", cascade={"all"})
     */
    private Collection $teams;

    /**
     * @ORM\Column(type="simple_array", nullable=TRUE)
     */
    public string|array|null $components = '';

    /**
     * @var Attachment[]
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\Attachment", mappedBy="exercisePhase", cascade={"persist", "remove"})
     * @ORM\OrderBy({"uploadAt" = "DESC"})
     */
    private Collection $attachment;

    /**
     * @var Video[]
     *
     * @ORM\ManyToMany(targetEntity="App\Entity\Video\Video", inversedBy="exercisePhases")
     */
    private Collection $videos;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Exercise\ExercisePhase")
     * @JoinColumn(referencedColumnName="id", nullable=true)
     */
    private ?ExercisePhase $dependsOnExercisePhase = null;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $otherSolutionsAreAccessible = false;

    public static function byType(ExercisePhaseType $type, string $id = null): VideoAnalysisPhase | VideoCutPhase | ReflexionPhase
    {
        return match ($type) {
            ExercisePhaseType::VIDEO_ANALYSIS => new VideoAnalysisPhase($id),
            ExercisePhaseType::VIDEO_CUT => new VideoCutPhase($id),
            ExercisePhaseType::REFLEXION => new ReflexionPhase($id),
            ExercisePhaseType::MATERIAL => new MaterialPhase($id),
        };
    }

    protected function __construct(string $id = null)
    {
        $this->generateOrSetId($id);
        $this->teams = new ArrayCollection();
        $this->attachment = new ArrayCollection();
        $this->videos = new ArrayCollection();
        $this->isGroupPhase = false;
    }

    public function __toString()
    {
        return $this->name;
    }

    /**
     * NOTE: Runtime only
     * @return ExercisePhaseType
     */
    public function getType(): ExercisePhaseType
    {
        return $this::type;
    }

    /**
     * @return ExercisePhaseTeam[]
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

    public function getBelongsToExercise(): Exercise
    {
        return $this->belongsToExercise;
    }

    public function setBelongsToExercise(Exercise $belongsToExercise): void
    {
        $this->belongsToExercise = $belongsToExercise;
    }

    public function getSorting(): int
    {
        return $this->sorting;
    }

    public function setSorting(int $sorting): void
    {
        $this->sorting = $sorting;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getTask(): string
    {
        return $this->task;
    }

    /**
     * Note that the parameter has to be optional, so that null can be passed to
     * it, whenever we use this entity in symphony forms, because validation
     * happens AFTER the form has been processed.
     * This is currently necessary as a validation workaround for our CKEditor-FormType (see ExercisePhaseFormType.php)
     */
    public function setTask(?string $task): void
    {
        $this->task = $task ?? '';
    }

    public function isGroupPhase(): bool
    {
        return $this->isGroupPhase;
    }

    public function setIsGroupPhase(bool $isGroupPhase): void
    {
        $this->isGroupPhase = $isGroupPhase;
    }

    public function getComponents(): ?array
    {
        return $this->components;
    }

    public function setComponents(array $components): void
    {
        $this->components = $components;
    }

    public function addAttachment(Attachment $attachment): self
    {
        $this->attachment->add($attachment);
        $attachment->setExercisePhase($this);
        return $this;
    }

    public function removeAttachment(Attachment $attachment): void
    {
        $this->attachment->removeElement($attachment);
    }

    /**
     * @return Attachment[]
     */
    public function getAttachment(): Collection
    {
        return $this->attachment;
    }

    /**
     * @return Video[]
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

    public function getDependsOnExercisePhase(): ?ExercisePhase
    {
        return $this->dependsOnExercisePhase;
    }

    public function setDependsOnExercisePhase(?ExercisePhase $exercisePhase): self
    {
        $this->dependsOnExercisePhase = $exercisePhase;

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

    public function getHasSolutions(): bool
    {
        $parentExercise = $this->getBelongsToExercise();
        $creator = $parentExercise->getCreator();
        $teams = $this->getTeams()->toArray();

        // A creator can test created phases and create solutions only the creator can see this way.
        // Therefore we need to check if solutions exist, where the creator isn't also the creator of the phase.
        $solutionsWithoutTestSolution = array_filter($teams, fn (ExercisePhaseTeam $team) => $team->getCreator() !== $creator);
        $hasSolutionsWithoutTestSolution = !empty($solutionsWithoutTestSolution);

        return $hasSolutionsWithoutTestSolution;
    }

    public function getAllowedComponents()
    {
        return [];
    }

    /**
     * Check if a Solution exists on a Team that the user is a member of.
     */
    public function getHasSolutionForUser(User $user): bool
    {
        return $this
            ->getTeams()
            ->exists(
                function ($i, ExercisePhaseTeam $exercisePhaseTeam) use ($user) {
                    return $exercisePhaseTeam->hasSolution() && $exercisePhaseTeam->getMembers()->contains($user);
                }
            );
    }
}
