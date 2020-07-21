<?php

namespace App\Entity\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Exercise\ExercisePhase;
use App\Repository\Video\VideoCodeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
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

    /**
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    private ?string $description = '';

    /**
     * @ORM\ManyToMany(targetEntity=ExercisePhase::class, mappedBy="videoCodes")
     */
    private Collection $exercisePhases;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=7)
     */
    private string $color = '';

    public function __construct($id = null)
    {
        $this->generateOrSetId($id);
        $this->exercisePhases = new ArrayCollection();
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

    /**
     * @return Collection|ExercisePhase[]
     */
    public function getExercisePhases(): Collection
    {
        return $this->exercisePhases;
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
}
