<?php

namespace App\Domain\Course;

use App\Domain\EntityTraits\IdentityTrait;
use App\Domain\Account\CourseRole;
use App\Domain\Exercise\Exercise;
use App\Domain\Fachbereich;
use App\Domain\Video\Video;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Account\CourseRepository")
 */
class Course
{
    use IdentityTrait;

    /**
     * @var string
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    public string $name = '';

    /**
     * @var DateTime
     *
     * @ORM\Column(type="datetime")
     * @Assert\NotBlank
     */
    public DateTime $creationDate;

    /**
     * @var Exercise[]
     * @ORM\OneToMany(targetEntity="App\Domain\Exercise\Exercise", mappedBy="course", orphanRemoval=true)
     */
    private Collection $exercises;

    /**
     * @var CourseRole[]
     * @ORM\OneToMany(targetEntity="App\Domain\Account\CourseRole", mappedBy="course", cascade={"all"}, orphanRemoval=true)
     */
    private Collection $courseRoles;

    /**
     * @var Video[]
     * @ORM\ManyToMany(targetEntity=Video::class, mappedBy="courses")
     */
    private Collection $videos;

    /**
     * @var Fachbereich | null
     * @ORM\ManyToOne(targetEntity=Fachbereich::class)
     */
    private ?Fachbereich $fachbereich;

    public function __construct($id = null)
    {
        $this->generateOrSetId($id);
        $this->courseRoles = new ArrayCollection();
        $this->exercises = new ArrayCollection();
        $this->creationDate = new DateTime();
        $this->videos = new ArrayCollection();
    }

    /**
     * @return CourseRole[]
     */
    public function getCourseRoles(): Collection
    {
        return $this->courseRoles;
    }

    public function addCourseRole(CourseRole $courseRole): self
    {
        if (!$this->courseRoles->contains($courseRole)) {
            $this->courseRoles[] = $courseRole;
            $courseRole->setCourse($this);
        }

        return $this;
    }

    public function removeCourseRole(CourseRole $courseRole): self
    {
        if ($this->courseRoles->contains($courseRole)) {
            $this->courseRoles->removeElement($courseRole);
            // set the owning side to null (unless already changed)
            if ($courseRole->getCourse() === $this) {
                $courseRole->setCourse(null);
            }
        }

        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getCreationDate(): DateTime
    {
        return $this->creationDate;
    }

    public function getCreationDateYear(): int
    {
        return $this->creationDate->format('Y');
    }

    /**
     * @return Exercise[]
     */
    public function getExercises(): Collection
    {
        return $this->exercises;
    }

    public function addExercise(Exercise $exercise): self
    {
        if (!$this->exercises->contains($exercise)) {
            $this->exercises[] = $exercise;
            $exercise->setCourse($this);
        }

        return $this;
    }

    public function removeExercise(Exercise $exercise): self
    {
        if ($this->exercises->contains($exercise)) {
            $this->exercises->removeElement($exercise);
            // set the owning side to null (unless already changed)
            if ($exercise->getCourse() === $this) {
                $exercise->setCourse(null);
            }
        }

        return $this;
    }

    public function __sleep()
    {
        return [];
    }

    /**
     * @return Video[]
     */
    public function getVideos(): Collection
    {
        return $this->videos;
    }

    public function addVideo(Video $video): self
    {
        if (!$this->videos->contains($video)) {
            $this->videos[] = $video;
            $video->addCourse($this);
        }

        return $this;
    }

    public function removeVideo(Video $video): self
    {
        if ($this->videos->contains($video)) {
            $this->videos->removeElement($video);
            $video->removeCourse($this);
        }

        return $this;
    }

    /**
     * @return Fachbereich|null
     */
    public function getFachbereich(): ?Fachbereich
    {
        return $this->fachbereich;
    }

    /**
     * @param Fachbereich|null $fachbereich
     */
    public function setFachbereich(?Fachbereich $fachbereich): void
    {
        $this->fachbereich = $fachbereich;
    }


}
