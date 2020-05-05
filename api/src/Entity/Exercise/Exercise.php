<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * This is a dummy entity. Remove it!
 *
 * @ApiResource
 * @ORM\Entity
 */
class Exercise
{
    /**
     * @var string The entity Id
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="UUID")
     * @ORM\Column(type="guid")
     */
    private $id;

    /**
     * @var string A nice person
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    public $name = '';

    /**
     * @var ExercisePhase[]
     * @ORM\OneToMany(targetEntity="ExercisePhase", mappedBy="belongsToExcercise", cascade={"all"})
     * @ORM\OrderBy({"sorting" = "ASC"})
     */
    private $phases;

    public function __construct(string $id = null) {
        $this->phases = new ArrayCollection();
        $this->id = $id;
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function __toString()
    {
        return $this->name;
    }

    /**
     * @return Exercise[]
     */
    public function getPhases(): Collection
    {
        return $this->phases;
    }

    /**
     * @param ExercisePhase[] $phases
     */
    public function setPhases(iterable $phases): void
    {
        foreach ($phases as $phase) {
            $phase->belongsToExcercise = $this;
        }
        $this->phases = $phases;
    }

    public function addPhase(ExercisePhase $exercisePhase): void
    {
        $exercisePhase->belongsToExcercise = $this;
        $exercisePhase->sorting = $this->phases->count();
        $this->phases->add($exercisePhase);
    }
}
