<?php

namespace App\Entity\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Video\Video;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseTypes\VideoAnalysisTypeRepository")
 */
class VideoAnalysis extends ExercisePhase
{
    const PHASE_COMPONENTS = [
        ExercisePhase::VIDEO_PLAYER,
//        ExercisePhase::VIDEO_CUTTING,
//        ExercisePhase::VIDEO_CODE,
//        ExercisePhase::VIDEO_ANNOTATION,
        ExercisePhase::DOCUMENT_UPLOAD,
    ];

    const PHASE_COMPONENTS_GROUP = [
        ExercisePhase::CHAT,
        ExercisePhase::SHARED_DOCUMENT,
    ];

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Video\Video", inversedBy="videoAnalysisTypes")
     */
    private $videos;

    /**
     * @ORM\Column(type="boolean")
     */
    private $videoAnnotationsActive = true;

    /**
     * @ORM\Column(type="boolean")
     */
    private $videoCodesActive = false;

    /**
     * @ORM\Column(type="boolean")
     */
    private $videoCuttingActive = false;

    public function __construct(string $id = null)
    {
        parent::__construct($id);
        $this->videos = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this::TYPE_VIDEO_ANALYSE;
    }

    /**
     * @return array
     */
    public function getAllowedComponents(): array
    {
        if ($this->isGroupPhase()) {
            return array_merge(self::PHASE_COMPONENTS, self::PHASE_COMPONENTS_GROUP);
        } else {
            return self::PHASE_COMPONENTS;
        }
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

    public function getVideoAnnotationsActive(): ?bool
    {
        return $this->videoAnnotationsActive;
    }

    public function setVideoAnnotationsActive(bool $videoAnnotationsActive): self
    {
        $this->videoAnnotationsActive = $videoAnnotationsActive;

        return $this;
    }

    public function getVideoCodesActive(): ?bool
    {
        return $this->videoCodesActive;
    }

    public function setVideoCodesActive(bool $videoCodesActive): self
    {
        $this->videoCodesActive = $videoCodesActive;

        return $this;
    }

    public function getVideoCuttingActive(): ?bool
    {
        return $this->videoCuttingActive;
    }

    public function setVideoCuttingActive(bool $videoCuttingActive): self
    {
        $this->videoCuttingActive = $videoCuttingActive;

        return $this;
    }
}
