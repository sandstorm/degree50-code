<?php

namespace App\Domain\Exercise\ExercisePhaseTypes;

use App\Domain\Exercise\ExercisePhase;
use App\Domain\Exercise\ExercisePhase\ExercisePhaseType;
use App\Domain\Exercise\VideoCode;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class VideoAnalysisPhase extends ExercisePhase
{
    const type = ExercisePhaseType::VIDEO_ANALYSIS;

    /**
     * @var VideoCode[]
     *
     * @ORM\OneToMany(targetEntity="App\Domain\Exercise\VideoCode", mappedBy="exercisePhase", cascade={"persist", "remove"})
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
