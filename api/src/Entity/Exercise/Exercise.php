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
     * @var Collection
     * @ORM\OneToMany(targetEntity="ExercisePhase", mappedBy="belongsToExcercise")
     * @ORM\OrderBy({"sorting" = "ASC"})
     */
    public $phases;

    public function __construct() {
        $this->phases = new ArrayCollection();
    }

    public function getId(): string
    {
        return $this->id;
    }
}
