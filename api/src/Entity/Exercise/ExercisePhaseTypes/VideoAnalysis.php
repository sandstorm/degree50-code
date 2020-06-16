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
        ExercisePhase::DOCUMENT_UPLOAD,
        ExercisePhase::VIDEO_CODE
    ];

    const PHASE_COMPONENTS_GROUP = VideoAnalysis::PHASE_COMPONENTS + [
        ExercisePhase::CHAT,
        ExercisePhase::SHARED_DOCUMENT,
    ];

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Video\Video", inversedBy="videoAnalysisTypes")
     */
    private $videos;

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
            return $this::PHASE_COMPONENTS_GROUP;
        } else {
            return $this::PHASE_COMPONENTS;
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
}
