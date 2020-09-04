<?php

namespace App\Entity\Exercise;

use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\User;
use App\Repository\Exercise\UserExerciseInteractionRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=UserExerciseInteractionRepository::class)
 */
class UserExerciseInteraction
{
    use IdentityTrait;

    /**
     * @var Exercise
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="userExerciseInteractions")
     * @ORM\JoinColumn(nullable=false)
     */
    private $exercise;

    /**
     * @var User
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="userExerciseInteractions")
     * @ORM\JoinColumn(nullable=false)
     */
    private $user;

    /**
     * @ORM\Column(type="boolean")
     */
    private $opened = false;

    /**
     * @ORM\Column(type="boolean")
     */
    private $finished = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getExercise(): ?Exercise
    {
        return $this->exercise;
    }

    public function setExercise(?Exercise $exercise): self
    {
        $this->exercise = $exercise;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function isOpened(): ?bool
    {
        return $this->opened;
    }

    public function setOpened(bool $opened): self
    {
        $this->opened = $opened;

        return $this;
    }

    public function isFinished(): ?bool
    {
        return $this->finished;
    }

    public function setFinished(bool $finished): self
    {
        $this->finished = $finished;

        return $this;
    }
}
