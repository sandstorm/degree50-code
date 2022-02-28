<?php

namespace App\Entity\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\VideoCode;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class VideoAnalysisPhase extends ExercisePhase
{
    const type = ExercisePhase\ExercisePhaseType::VIDEO_ANALYSIS;

    const PHASE_COMPONENTS = [
        ExercisePhase::VIDEO_PLAYER,
        //ExercisePhase::DOCUMENT_UPLOAD,
    ];

    const PHASE_COMPONENTS_GROUP = [
        //ExercisePhase::CHAT,
        //ExercisePhase::SHARED_DOCUMENT,
    ];

    /**
     * @var VideoCode[]
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\VideoCode", mappedBy="exercisePhase", cascade={"persist", "remove"})
     * @ORM\OrderBy({"name" = "ASC"})
     */
    private Collection $videoCodes;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $videoAnnotationsActive = true;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $videoCodesActive = false;

    public function __construct(string $id = null)
    {
        parent::__construct($id);

        $this->videoCodes = new ArrayCollection();
    }

    /**
     * @return VideoCode[]
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
}
