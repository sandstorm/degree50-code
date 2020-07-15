<?php

namespace App\Entity\Account;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Exercise\Exercise;
use App\Entity\Video\Video;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ApiResource()
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
    public $creationDate;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\Exercise", mappedBy="course", orphanRemoval=true)
     */
    private Collection $exercises;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Account\CourseRole", mappedBy="course", cascade={"all"}, orphanRemoval=true)
     */
    private Collection $courseRoles;

    /**
     * @ORM\ManyToMany(targetEntity=Video::class, mappedBy="Courses")
     */
    private Collection $videos;

    public function __construct($id = null)
    {
        $this->generateOrSetId($id);
        $this->courseRoles = new ArrayCollection();
        $this->exercises = new ArrayCollection();
        $this->creationDate = new DateTime();
        $this->videos = new ArrayCollection();
    }

    /**
     * @return Collection|CourseRole[]
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
     * @return DateTime
     */
    public function getCreationDate(): DateTime
    {
        return $this->creationDate;
    }

    /**
     * @return int
     */
    public function getCreationDateYear(): int
    {
        return $this->creationDate->format('Y');
    }

    /**
     * @return Collection|Exercise[]
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
     * @return Collection|Video[]
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
}
