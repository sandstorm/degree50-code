<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\Course;
use App\Entity\Account\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * This is a dummy entity. Remove it!
 *
 * @ApiResource
 * @ORM\HasLifecycleCallbacks()
 * @ORM\Entity
 */
class Exercise implements ExerciseInterface
{
    use IdentityTrait;

    const EXERCISE_CREATED = 0;
    const EXERCISE_PUBLISHED = 2;
    const EXERCISE_FINISHED = 1;

    /**
     * @var string A nice person
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    public $name = '';

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    public $description = '';

    /**
     * @var ExercisePhase[]
     * @ORM\OneToMany(targetEntity="ExercisePhase", mappedBy="belongsToExercise", cascade={"all"})
     * @ORM\OrderBy({"sorting" = "ASC"})
     */
    private $phases;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\Course", inversedBy="exercises")
     * @ORM\JoinColumn(nullable=true)
     */
    private $course;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="createdExercises")
     * @ORM\JoinColumn(nullable=false)
     */
    private $creator;

    /**
     * @var \DateTimeImmutable|null
     *
     * @ORM\Column(name="created_at", type="datetimetz_immutable")
     */
    private $createdAt;

    /**
     * 0 = created
     * 1 = finished
     * 2 = published
     * @ORM\Column(type="integer")
     */
    private $status = self::EXERCISE_CREATED;

    /**
     * @var UserExerciseInteraction[]
     * @ORM\OneToMany(targetEntity="UserExerciseInteraction", mappedBy="exercise",  cascade={"remove"})
     */
    private $userExerciseInteractions;

    public function __construct(string $id = null) {
        $this->phases = new ArrayCollection();
        $this->userExerciseInteractions = new ArrayCollection();
        $this->generateOrSetId($id);
    }

    /**
     * @ORM\PrePersist
     */
    public function setCreatedAtValue()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getType(): string
    {
        return 'unspecified';
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
            $phase->belongsToExercise = $this;
        }
        $this->phases = $phases;
    }

    public function addPhase(ExercisePhase $exercisePhase): void
    {
        $exercisePhase->belongsToExercise = $this;
        $exercisePhase->sorting = $this->phases->count();
        $this->phases->add($exercisePhase);
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name): void
    {
        $this->name = $name;
    }

    /**
     * @return Course
     */
    public function getCourse(): ?Course
    {
        return $this->course;
    }

    /**
     * @param Course $course
     */
    public function setCourse($course): void
    {
        $this->course = $course;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * @param string $description
     */
    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    /**
     * @return User
     */
    public function getCreator(): User
    {
        return $this->creator;
    }

    /**
     * @param User $creator
     * @return $this
     */
    public function setCreator(User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * @return \DateTimeImmutable|null
     */
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * @return int
     */
    public function getStatus(): int
    {
        return $this->status;
    }

    /**
     * @param int $status
     */
    public function setStatus(int $status): void
    {
        $this->status = $status;
    }

    /**
     * @return Collection|UserExerciseInteraction[]
     */
    public function getUserExerciseInteractions(): Collection
    {
        return $this->userExerciseInteractions;
    }
}
