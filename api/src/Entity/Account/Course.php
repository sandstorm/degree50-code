<?php

namespace App\Entity\Account;

use ApiPlatform\Core\Annotation\ApiResource;
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
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    public $name = '';

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Account\CourseRole", mappedBy="course", orphanRemoval=true)
     */
    private Collection $courseRoles;

    public function __construct()
    {
        $this->courseRoles = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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
}
