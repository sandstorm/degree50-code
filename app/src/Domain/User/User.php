<?php

namespace App\Domain;

use App\Domain\EntityTraits\IdentityTrait;
use App\Security\Voter\DataPrivacyVoter;
use App\Security\Voter\TermsOfUseVoter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Domain\User\Repository\UserRepository")
 * TODO: possible leak of used email!
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

    const EXPIRATION_DURATION_STRING = '5 years';
    const DB_DATE_FORMAT = 'Y-m-d H:i:s';
    const EXPIRATION_NOTICE_DURATION_STRING = '8 months';
    const VERIFICATION_TIMEOUT_DURATION_STRING = '5 days';

    const MIN_PASSWORD_LENGTH = 8;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private string $email;

    /**
     * @ORM\Column(type="json")
     */
    private array $roles = [];

    /**
     * This is solely used to define a plain unencrypted password inside the admin ui which will be encrypted and written
     * to self::password upon persistence.
     * @see EasyAdminSubscriber
     * @see UserCrudController
     */
    private ?string $plainPassword = '';

    /**
     * @ORM\Column(type="string")
     */
    private string $password;

    /**
     * @var Collection<CourseRole>
     *
     * @ORM\OneToMany(targetEntity="App\Domain\Account\CourseRole", mappedBy="user", orphanRemoval=true)
     */
    private Collection $courseRoles;

    /**
     * @var Collection<Exercise>
     *
     * @ORM\OneToMany(targetEntity="App\Domain\Exercise\Exercise", mappedBy="creator")
     */
    private Collection $createdExercises;

    /**
     * @var Collection<Video>
     *
     * @ORM\OneToMany(targetEntity="App\Domain\Video\Video", mappedBy="creator")
     */
    private Collection $createdVideos;

    /**
     * @var Collection<VideoFavorite>
     *
     * @ORM\OneToMany(targetEntity="App\Domain\Video\VideoFavorite", mappedBy="user")
     */
    private Collection $favoriteVideos;

    /**
     * @var Collection<Material>
     *
     * @ORM\OneToMany(targetEntity="App\Domain\Material\Material", mappedBy="owner")
     */
    private Collection $materials;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $dataPrivacyAccepted = false;

    /**
     * @ORM\Column(type="smallint", options={"default":1})
     */
    private int $dataPrivacyVersion = 1;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $termsOfUseAccepted = false;

    /**
     * @ORM\Column(type="smallint", options={"default":0})
     */
    private int $termsOfUseVersion = 0;

    /**
     * @ORM\Column(name="created_at", type="datetimetz_immutable")
     */
    private \DateTimeImmutable $createdAt;

    /**
     * @ORM\Column(name="expiration_date", type="datetimetz_immutable")
     */
    private \DateTimeImmutable $expirationDate;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $isVerified = false;

    /**
     * @ORM\Column(type="boolean")
     */
    private bool $expirationNoticeSent = false;

    public function __construct(?string $id = null)
    {
        $this->courseRoles = new ArrayCollection();
        $this->createdExercises = new ArrayCollection();
        $this->createdVideos = new ArrayCollection();
        $this->favoriteVideos = new ArrayCollection();
        $this->generateOrSetId($id);
        $this->createdAt = new \DateTimeImmutable();
        $this->expirationDate = $this->createdAt->add(
            \DateInterval::createFromDateString(self::EXPIRATION_DURATION_STRING)
        );
    }

    public function getUserIdentifier(): string
    {
        return $this->getId();
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
        return $this->email;
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
        // However we expect the structure to always be a list, which is why we make sure here,
        // that we actually get one ;)
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
        return $this->password;
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
            $courseRole->setUser($this);
        }

        return $this;
    }

    public function removeCourseRole(CourseRole $courseRole): self
    {
        if ($this->courseRoles->contains($courseRole)) {
            $this->courseRoles->removeElement($courseRole);
            // set the owning side to null (unless already changed)
            // TODO: Why?
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

    public function isSSOUser(): bool
    {
        return in_array(self::ROLE_SSO_USER, $this->roles);
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

    public function setDataPrivacyVersion(int $dataPrivacyVersion): void
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

    public function setTermsOfUseVersion(int $termsOfUseVersion): void
    {
        $this->termsOfUseVersion = $termsOfUseVersion;
    }

    public function acceptedCurrentTermsOfUse(): bool
    {
        return $this->termsOfUseAccepted && $this->termsOfUseVersion >= TermsOfUseVoter::TERMS_OF_USE_VERSION;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword($plainPassword): void
    {
        $this->plainPassword = $plainPassword;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getExpirationDate(): \DateTimeImmutable
    {
        return $this->expirationDate;
    }

    public function setExpirationDate(\DateTimeImmutable $expirationDate): void
    {
        $this->expirationDate = $expirationDate;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function isExpirationNoticeSent(): bool
    {
        return $this->expirationNoticeSent;
    }

    public function setExpirationNoticeSent(bool $expirationNoticeSent): void
    {
        $this->expirationNoticeSent = $expirationNoticeSent;
    }
}
