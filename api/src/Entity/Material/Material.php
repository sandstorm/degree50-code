<?php

namespace App\Entity\Material;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource
 * @ORM\Entity(repositoryClass="App\Repository\Material\MaterialRepository")
 */
class Material
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private string $material;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="materials")
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
     * @var ExercisePhaseTeam
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Exercise\ExercisePhaseTeam")
     */
    private ?ExercisePhaseTeam $originalPhaseTeam;

    public function __construct(string $id = null)
    {
        $this->generateOrSetId($id);
    }

    public function getMaterial()
    {
        return $this->material;
    }

    public function setMaterial($material)
    {
        $this->material = $material;
    }

    public function getOwner()
    {
        return $this->owner;
    }

    public function setOwner($owner)
    {
        $this->owner = $owner;
    }

    public function getOriginalPhaseTeam()
    {
        return $this->originalPhaseTeam;
    }

    public function setOriginalPhaseTeam($originalPhaseTeam)
    {
        $this->originalPhaseTeam = $originalPhaseTeam;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt)
    {
        $this->createdAt = $createdAt;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getLastUpdatedAt()
    {
        return $this->lastUpdatedAt;
    }

    public function setLastUpdatedAt($lastUpdatedAt)
    {
        $this->lastUpdatedAt = $lastUpdatedAt;
    }
}
