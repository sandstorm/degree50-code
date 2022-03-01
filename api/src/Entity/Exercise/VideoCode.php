<?php

namespace App\Entity\Exercise;

use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Repository\Exercise\VideoCodeRepository;
use Doctrine\ORM\Mapping as ORM;

// NOTE:
// This actually what we call a 'VideoCodePrototype' not an actual 'videoCode'!!!
// The naming was very misleading in the past. It might make sense to
// change the schema in the future. (I am just currently in the middle of
// a rather big refactoring and don't know how to easily change the schema and
// migrate existing data)

/**
 * @ORM\Entity(repositoryClass=VideoCodeRepository::class)
 */
class VideoCode
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name = '';

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase", inversedBy="videoCodes")
     * @ORM\JoinColumn(nullable=true)
     */
    private ?VideoAnalysisPhase $exercisePhase;

    /**
     * @ORM\Column(type="string", length=7)
     */
    private string $color = '';

    public function __construct($id = null)
    {
        $this->generateOrSetId($id);
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(string $color): self
    {
        $this->color = $color;

        return $this;
    }

    public function getExercisePhase(): ?VideoAnalysisPhase
    {
        return $this->exercisePhase;
    }

    public function setExercisePhase(?VideoAnalysisPhase $exercisePhase): void
    {
        $this->exercisePhase = $exercisePhase;
    }
}
