<?php

namespace App\Domain\Material\Model;

use App\Domain\EntityTraits\IdentityTrait;
use App\Domain\ExercisePhaseTeam\Model\ExercisePhaseTeam;
use App\Domain\User\Model\User;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Domain\Material\Repository\MaterialRepository")
 */
class Material
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private string $material;

    /**
     * @ORM\ManyToOne(targetEntity="App\Domain\User", inversedBy="materials")
     * @ORM\JoinColumn(nullable=false)
     */
    private User $owner;

    /**
     * @ORM\Column(name="created_at", type="datetimetz_immutable")
     */
    private ?DateTimeImmutable $createdAt;

    /**
     * @ORM\Column(name="last_updated_at", type="datetimetz_immutable", nullable=true)
     */
    private ?DateTimeImmutable $lastUpdatedAt = null;

    /**
     * @var ExercisePhaseTeam|null
     *
     * @ORM\ManyToOne(targetEntity="App\Domain\Exercise\ExercisePhaseTeam")
     */
    private ?ExercisePhaseTeam $originalPhaseTeam;

    public function __construct(string $id = null)
    {
        $this->generateOrSetId($id);
    }

    public function getMaterial(): string
    {
        return $this->material;
    }

    public function setMaterial(string $material): void
    {
        $this->material = $material;
    }

    public function getOwner(): User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): void
    {
        $this->owner = $owner;
    }

    public function getOriginalPhaseTeam(): ?ExercisePhaseTeam
    {
        return $this->originalPhaseTeam;
    }

    public function setOriginalPhaseTeam(?ExercisePhaseTeam $originalPhaseTeam): void
    {
        $this->originalPhaseTeam = $originalPhaseTeam;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getLastUpdatedAt(): ?DateTimeImmutable
    {
        return $this->lastUpdatedAt;
    }

    public function setLastUpdatedAt(?DateTimeImmutable $lastUpdatedAt): void
    {
        $this->lastUpdatedAt = $lastUpdatedAt;
    }
}
