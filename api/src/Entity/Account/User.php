<?php

namespace App\Entity\Account;

use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\UserExerciseInteraction;
use App\Entity\Video\Video;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Account\UserRepository")
 * @UniqueEntity(fields={"email"}, message="There is already an account with this email")
 */
class User implements UserInterface
{
    use IdentityTrait;

    /**
     * @var string
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private $email;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @var string The hashed password
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Account\CourseRole", mappedBy="user", orphanRemoval=true)
     */
    private Collection $courseRoles;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\Exercise", mappedBy="creator")
     */
    private Collection $createdExercises;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Video\Video", mappedBy="creator")
     */
    private $createdVideos;

    /**
     * @var UserExerciseInteraction[]
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\UserExerciseInteraction", mappedBy="user")
     */
    private $userExerciseInteractions;

    public function __construct(?string $id = null)
    {
        $this->courseRoles = new ArrayCollection();
        $this->createdExercises = new ArrayCollection();
        $this->createdVideos = new ArrayCollection();
        $this->userExerciseInteractions = new ArrayCollection();
        $this->generateOrSetId($id);
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string)$this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string)$this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function __toString()
    {
        return $this->email;
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
            $courseRole->setUser($this);
        }

        return $this;
    }

    public function removeCourseRole(CourseRole $courseRole): self
    {
        if ($this->courseRoles->contains($courseRole)) {
            $this->courseRoles->removeElement($courseRole);
            // set the owning side to null (unless already changed)
            if ($courseRole->getUser() === $this) {
                $courseRole->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection|Exercise[]
     */
    public function getCreatedExercises(): Collection
    {
        return $this->createdExercises;
    }

    /**
     * @return Collection|Video[]
     */
    public function getCreatedVideos(): Collection
    {
        return $this->createdVideos;
    }

    public function setIsAdmin(bool $isAdmin): void
    {
        if ($isAdmin) {
            $this->roles[] = 'ROLE_ADMIN';
        } else {
            $this->roles = array_filter($this->roles, function($role) {
                return $role !== 'ROLE_ADMIN';
            });
        }
    }

    public function isAdmin(): bool
    {
        return in_array('ROLE_ADMIN', $this->roles);
    }
}
