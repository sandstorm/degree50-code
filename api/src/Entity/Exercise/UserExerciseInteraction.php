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
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="userExerciseInteractions")
     * @ORM\JoinColumn(nullable=false)
     */
    private Exercise $exercise;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="userExerciseInteractions")
     * @ORM\JoinColumn(nullable=false)
     */
    private User $user;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $opened = false;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $finished = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getExercise(): Exercise
    {
        return $this->exercise;
    }

    public function setExercise(Exercise $exercise): self
    {
        $this->exercise = $exercise;

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
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
