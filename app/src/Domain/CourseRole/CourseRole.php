<?php

namespace App\Domain;

use App\Domain\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="App\Domain\CourseRole\Repository\CourseRoleRepository")
 */
class CourseRole
{
    use IdentityTrait;

    const DOZENT = 'DOZENT';
    const STUDENT = 'STUDENT';
    const ROLES = [self::DOZENT, self::STUDENT];

    /**
     * @ORM\Column
     * @Assert\NotBlank
     * @Assert\Choice(choices=CourseRole::ROLES, message="Choose a valid role.")
     */
    public string $name = '';

    /**
     * @ORM\ManyToOne(targetEntity="App\Domain\User", inversedBy="courseRoles")
     * @ORM\JoinColumn(nullable=false)
     */
    private User $user;

    /**
     * @ORM\ManyToOne(targetEntity="App\Domain\Account\Course", inversedBy="courseRoles")
     * @ORM\JoinColumn(nullable=false)
     */
    private Course $course;

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getCourse(): Course
    {
        return $this->course;
    }

    public function setCourse(Course $course): self
    {
        $this->course = $course;

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

    public function isCourseDozent(): bool
    {
        return $this->name === self::DOZENT;
    }

    public function isCourseStudent(): bool
    {
        return $this->name === self::STUDENT;
    }

    public function __toString()
    {
        return sprintf('CourseRole<%s, %s, %s>', $this->getCourse()->getName(), $this->getUser()->getEmail(), $this->name);
    }
}
