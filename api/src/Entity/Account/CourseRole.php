<?php

namespace App\Entity\Account;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass="App\Repository\Account\CourseRoleRepository")
 */
class CourseRole
{
    use IdentityTrait;

    const DOZENT = 'DOZENT';
    const STUDENT = 'STUDENT';
    const ROLES = [self::DOZENT, self::STUDENT];

    /**
     * @var string
     *
     * @ORM\Column
     * @Assert\NotBlank
     * @Assert\Choice(choices=CourseRole::ROLES, message="Choose a valid role.")
     */
    public $name = '';

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="courseRoles")
     * @ORM\JoinColumn(nullable=false)
     */
    private ?User $user = null;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\Course", inversedBy="courseRoles")
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

    public function __toString()
    {
        return sprintf('CourseRole<%s, %s, %s>', $this->getCourse()->getName(), $this->getUser()->getEmail(), $this->name);
    }


}
