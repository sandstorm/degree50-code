<?php

namespace App\Entity\Exercise;

use App\Core\EntityTraits\IdentityTrait;
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
     * @var string
     *
     * @ORM\Column(type="string", length=255)
     */
    private string $name = '';

    // FIXME
    // Do we actually need the videoCodePrototype description?
    // As far as I can tell we never make this available inside the frontend anyway.
    // TODO
    // (also remove from videoCodePrototypeItem inside the frontend)

    /**
     * @var ?string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    private ?string $description = '';

    /**
     * @ORM\ManyToOne(targetEntity="ExercisePhase", inversedBy="videoCodes")
     * @ORM\JoinColumn(nullable=true)
     */
    private $exercisePhase;

    /**
     * @var string
     *
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

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

    /**
     * @return mixed
     */
    public function getExercisePhase()
    {
        return $this->exercisePhase;
    }

    /**
     * @param mixed $exercisePhase
     */
    public function setExercisePhase($exercisePhase): void
    {
        $this->exercisePhase = $exercisePhase;
    }
}
