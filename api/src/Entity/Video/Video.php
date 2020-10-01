<?php

namespace App\Entity\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\VirtualizedFile;
use App\Twig\AppRuntime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks()
 */
class Video
{
    use IdentityTrait;

    const ENCODING_NOT_STARTED = 0;
    const ENCODING_STARTED = 2;
    const ENCODING_ERROR = 3;
    const ENCODING_FINISHED = 1;

    /**
     * @ORM\Column(type="text")
     * @ApiFilter(SearchFilter::class, strategy="ipartial")
     */
    private string $title = '';

    /**
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    private ?string $description = '';

    /**
     * @ORM\Embedded(class=VirtualizedFile::class)
     */
    private ?VirtualizedFile $uploadedVideoFile;

    /**
     * @ORM\Embedded(class=VirtualizedFile::class)
     */
    private ?VirtualizedFile $encodedVideoDirectory;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Video\VideoSubtitles", cascade={"persist", "remove"})
     */
    private $subtitles;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Exercise\ExercisePhase", mappedBy="videos")
     */
    private $exercisePhases;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="createdVideos")
     * @ORM\JoinColumn(nullable=false)
     */
    private $creator;

    /**
     * @var \DateTimeImmutable|null
     *
     * @ORM\Column(name="created_at", type="datetimetz_immutable")
     */
    private $createdAt;

    /**
     * @ORM\ManyToMany(targetEntity=Course::class, inversedBy="videos")
     */
    private Collection $courses;

    /**
     * @ORM\Column(type="boolean")
     */
    private $dataPrivacyAccepted;

    /**
     * 0 = not started
     * 1 = finished
     * 2 = started
     * 3 = error
     * @ORM\Column(type="integer")
     */
    private $encodingStatus = self::ENCODING_NOT_STARTED;

    /**
     * @var float|null
     * @ORM\Column(type="float", nullable=true)
     */
    private $videoDuration;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $visiblePersons;

    /**
     * @ORM\Column(type="datetimetz_immutable", nullable=true)
     */
    private $encodingStarted;

    /**
     * @ORM\Column(type="datetimetz_immutable", nullable=true)
     */
    private $encodingFinished;

    /**
     * Video constructor.
     * @param string $id
     */
    public function __construct(string $id = '')
    {
        $this->generateOrSetId($id);
        $this->exercisePhases = new ArrayCollection();
        $this->courses = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    /**
     * @return string
     */
    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @param string $description
     */
    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    /**
     * @return ?VirtualizedFile
     */
    public function getUploadedVideoFile(): ?VirtualizedFile
    {
        return $this->uploadedVideoFile;
    }

    /**
     * @param VirtualizedFile $uploadedVideoFile
     */
    public function setUploadedVideoFile(VirtualizedFile $uploadedVideoFile): void
    {
        $this->uploadedVideoFile = $uploadedVideoFile;
    }

    /**
     * @return ?VirtualizedFile
     */
    public function getEncodedVideoDirectory(): ?VirtualizedFile
    {
        return $this->encodedVideoDirectory;
    }

    /**
     * @param VirtualizedFile $encodedVideoDirectory
     */
    public function setEncodedVideoDirectory(VirtualizedFile $encodedVideoDirectory): void
    {
        $this->encodedVideoDirectory = $encodedVideoDirectory;
    }

    public function getSubtitles(): ?VideoSubtitles
    {
        return $this->subtitles;
    }

    public function setSubtitles(?VideoSubtitles $subtitles): self
    {
        $this->subtitles = $subtitles;

        return $this;
    }

    /**
     * @return Collection|ExercisePhase[]
     */
    public function getExercisePhases(): Collection
    {
        return $this->exercisePhases;
    }

    public function addVideoAnalysisType(ExercisePhase $exercisePhase): self
    {
        if (!$this->exercisePhases->contains($exercisePhase)) {
            $this->exercisePhases[] = $exercisePhase;
            $exercisePhase->addVideo($this);
        }

        return $this;
    }

    public function removeVideoAnalysisType(ExercisePhase $exercisePhase): self
    {
        if ($this->exercisePhases->contains($exercisePhase)) {
            $this->exercisePhases->removeElement($exercisePhase);
            $exercisePhase->removeVideo($this);
        }

        return $this;
    }

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(?User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * @return Collection|Course[]
     */
    public function getCourses(): Collection
    {
        return $this->courses;
    }

    public function addCourse(Course $course): self
    {
        if (!$this->courses->contains($course)) {
            $this->courses[] = $course;
        }

        return $this;
    }

    public function removeCourse(Course $course): self
    {
        if ($this->courses->contains($course)) {
            $this->courses->removeElement($course);
        }

        return $this;
    }

    public function getDataPrivacyAccepted(): ?bool
    {
        return $this->dataPrivacyAccepted;
    }

    public function setDataPrivacyAccepted(bool $dataPrivacyAccepted): self
    {
        $this->dataPrivacyAccepted = $dataPrivacyAccepted;

        return $this;
    }

    /**
     * Get videoDuration.
     *
     * @return ?float.
     */
    public function getVideoDuration(): ?float
    {
        if ($this->videoDuration) {
            return $this->videoDuration;
        } else {
            // if the video has not yet been initialized, we do not yet have a duration
            return 0;
        }
    }

    /**
     * Set videoDuration.
     *
     * @param float $videoDuration
     */
    public function setVideoDuration($videoDuration): void
    {
        $this->videoDuration = $videoDuration;
    }

    /**
     * @return int
     */
    public function getEncodingStatus(): int
    {
        return $this->encodingStatus;
    }

    /**
     * @param int $encodingStatus
     */
    public function setEncodingStatus(int $encodingStatus): void
    {
        switch ($encodingStatus) {
            case self::ENCODING_STARTED:
                $this->encodingStarted = new \DateTimeImmutable();
                break;
            case self::ENCODING_FINISHED:
                $this->encodingFinished = new \DateTimeImmutable();
                break;
        }

        $this->encodingStatus = $encodingStatus;
    }

    /**
     * @ORM\PrePersist
     */
    public function setCreatedAtValue()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    /**
     * @return \DateTimeImmutable|null
     */
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getAsArray(AppRuntime $appRuntime): array {
        $videoUrl = $appRuntime->virtualizedFileUrl($this->getEncodedVideoDirectory());

        if (empty($this->getSubtitles())) {
            // Initialize subtitles
            $this->setSubtitles(new VideoSubtitles());
        }

        return [
            'id' => $this->getId(),
            'name' => $this->getTitle(),
            'description' => $this->getDescription(),
            'duration' => $this->getVideoDuration(),
            'subtitles' => $this->getSubtitles()->getSubtitles(),
            'url' => [
                'hls' => $videoUrl . '/hls.m3u8',
                'mp4' => $videoUrl . '/x264.mp4',
                'vtt' => $videoUrl . '/subtitles.vtt',
            ]
        ];
    }

    public function getVisiblePersons(): ?string
    {
        return $this->visiblePersons;
    }

    public function setVisiblePersons(?string $visiblePersons): self
    {
        $this->visiblePersons = $visiblePersons;

        return $this;
    }

    public function getEncodingStarted(): ?\DateTimeImmutable
    {
        return $this->encodingStarted;
    }

    public function setEncodingStarted(?\DateTimeImmutable $encodingStarted): self
    {
        $this->encodingStarted = $encodingStarted;

        return $this;
    }

    public function getEncodingFinished(): ?\DateTimeImmutable
    {
        return $this->encodingFinished;
    }

    public function setEncodingFinished(?\DateTimeImmutable $encodingFinished): self
    {
        $this->encodingFinished = $encodingFinished;

        return $this;
    }
}
