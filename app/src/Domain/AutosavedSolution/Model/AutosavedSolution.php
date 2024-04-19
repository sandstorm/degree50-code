<?php

namespace App\Domain\AutosavedSolution\Model;

use App\Domain\EntityTraits\IdentityTrait;
use App\Domain\ExercisePhaseTeam\Model\ExercisePhaseTeam;
use App\Domain\Solution\Dto\ServerSideSolutionData\ServerSideSolutionData;
use App\Domain\User\Model\User;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Domain\AutosavedSolution\Repository\AutosavedSolutionRepository")]
#[ORM\HasLifecycleCallbacks()]
class AutosavedSolution
{
    use IdentityTrait;

    #[ORM\Column(type: "json")]
    private array $solution = [];

    #[ORM\Column(type: "datetimetz_immutable")]
    private ?DateTimeImmutable $update_timestamp;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $owner;

    #[ORM\ManyToOne(targetEntity: "App\Domain\Exercise\ExercisePhaseTeam", inversedBy: "autosavedSolutions")]
    #[ORM\JoinColumn(nullable: false)]
    private ExercisePhaseTeam $team;

    // TODO: get id of original Solution (via Team)
    // TODO: fake the id of AutosavedSolution to be the original Solution->id when sent to frontend

    public function getSolution(): ?ServerSideSolutionData
    {
        return ServerSideSolutionData::fromArray($this->solution);
    }

    public function setSolution(ServerSideSolutionData $solutionData): self
    {
        $this->solution = $solutionData->toArray();

        return $this;
    }

    public function getUpdateTimestamp(): ?DateTimeImmutable
    {
        return $this->update_timestamp;
    }

    #[ORM\PrePersist]
    public function setUpdateTimestampValue(): void
    {
        $this->update_timestamp = new DateTimeImmutable();
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): self
    {
        $this->owner = $owner;

        return $this;
    }

    public function getTeam(): ?ExercisePhaseTeam
    {
        return $this->team;
    }

    public function setTeam(?ExercisePhaseTeam $team): self
    {
        $this->team = $team;

        return $this;
    }
}
