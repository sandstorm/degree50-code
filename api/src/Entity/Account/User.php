<?php

namespace App\Entity\Account;

use App\Admin\Controller\UserCrudController;
use App\Admin\EventSubscriber\EasyAdminSubscriber;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Exercise\UserExerciseInteraction;
use App\Security\Voter\DataPrivacyVoter;
use App\Security\Voter\TermsOfUseVoter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Account\UserRepository")
 * TODO: possible leak of used email?
 * @UniqueEntity(fields={"email"}, message="There is already an account with this email")
 */
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use IdentityTrait;

    const ROLE_USER = 'ROLE_USER';
    const ROLE_ADMIN = 'ROLE_ADMIN';
    const ROLE_STUDENT = 'ROLE_STUDENT';
    const ROLE_DOZENT = 'ROLE_DOZENT';
    const ROLE_SSO_USER = 'ROLE_SSO_USER';

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
     * This is solely used to define a plain unencrypted password inside the admin ui which will be encrypted and written
     * to self::password upon persistence.
     * @see EasyAdminSubscriber
     * @see UserCrudController
     */
    private ?string $plainPassword = '';

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
     * @ORM\OneToMany(targetEntity="App\Entity\Exercise\UserExerciseInteraction", mappedBy="user", orphanRemoval=true)
     */
    private $userExerciseInteractions;

    /**
     * @ORM\Column(type="boolean")
     */
    private $dataPrivacyAccepted = false;

    /**
     * @ORM\Column(type="smallint", options={"default":1})
     */
    private $dataPrivacyVersion = 1;

    /**
     * @ORM\Column(type="boolean")
     */
    private $termsOfUseAccepted = false;

    /**
     * @ORM\Column(type="smallint", options={"default":0})
     */
    private $termsOfUseVersion = 0;

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
        $roles[] = self::ROLE_USER;

        // WHY the array_values:
        // The way doctrine saves these roles inside the database sometimes differs (no idea why.).
        // Sometimes doctrine will save them as array list and sometimes it saves them as associative array.
        // However we expect the structure to always be a list, which is why we make sure here, that we actually get one ;)
        return array_values(array_unique($roles));
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

    public function setIsAdmin(bool $isAdmin): void
    {
        $this->setRole(self::ROLE_ADMIN, $isAdmin);
    }

    public function setIsStudent(bool $isStudent): void
    {
        $this->setRole(self::ROLE_STUDENT, $isStudent);
    }

    public function setIsDozent(bool $isDozent): void
    {
        $this->setRole(self::ROLE_DOZENT, $isDozent);
    }

    public function setIsSSOUser(bool $isSSOUser): void
    {
        $this->setRole(self::ROLE_SSO_USER, $isSSOUser);
    }

    private function setRole(string $roleToSet, bool $set): void
    {
        if ($set) {
            $this->roles[] = $roleToSet;
        } else {
            $this->roles = array_filter($this->roles, function ($role) use ($roleToSet) {
                return $role !== $roleToSet;
            });
        }
    }

    public function isAdmin(): bool
    {
        return in_array(self::ROLE_ADMIN, $this->roles);
    }

    public function isStudent(): bool
    {
        return in_array(self::ROLE_STUDENT, $this->roles);
    }

    public function isDozent(): bool
    {
        return in_array(self::ROLE_DOZENT, $this->roles);
    }

    public function getDataPrivacyAccepted(): ?bool
    {
        return $this->dataPrivacyAccepted;
    }

    public function setDataPrivacyAccepted(bool $dataPrivacyAccepted): self
    {
        $this->dataPrivacyAccepted = $dataPrivacyAccepted;
        return $this;
    }

    public function getDataPrivacyVersion(): int
    {
        return $this->dataPrivacyVersion;
    }

    public function setDataPrivacyVersion(int $dataPrivacyVersion)
    {
        $this->dataPrivacyVersion = $dataPrivacyVersion;
    }

    public function acceptedCurrentDataPrivacy(): bool
    {
        return $this->dataPrivacyAccepted && $this->dataPrivacyVersion >= DataPrivacyVoter::DATA_PRIVACY_VERSION;
    }


    public function getTermsOfUseAccepted(): ?bool
    {
        return $this->termsOfUseAccepted;
    }

    public function setTermsOfUseAccepted(bool $termsOfUseAccepted): self
    {
        $this->termsOfUseAccepted = $termsOfUseAccepted;
        return $this;
    }

    public function getTermsOfUseVersion(): int
    {
        return $this->termsOfUseVersion;
    }

    public function setTermsOfUseVersion(int $termsOfUseVersion)
    {
        $this->termsOfUseVersion = $termsOfUseVersion;
    }

    public function acceptedCurrentTermsOfUse(): bool
    {
        return $this->termsOfUseAccepted && $this->termsOfUseVersion >= TermsOfUseVoter::TERMS_OF_USE_VERSION;
    }

    public function getPlainPassword()
    {
        return $this->plainPassword;
    }

    public function setPlainPassword($plainPassword)
    {
        $this->plainPassword = $plainPassword;
    }
}
