<?php

namespace App\Domain\Solution;

use App\Domain\EntityTraits\IdentityTrait;
use App\Domain\Exercise\Dto\ServerSideSolutionData\ServerSideSolutionData;
use App\Domain\Video\Video;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\SolutionRepository")
 */
class Solution
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="json")
     */
    private array $solution;

    /**
     * @ORM\Column(type="datetimetz_immutable")
     */
    private DateTimeImmutable $update_timestamp;

    /**
     * @ORM\OneToOne(targetEntity="App\Domain\Video\Video", cascade={"remove"})
     */
    private ?Video $cutVideo = null;

    /**
     * Solution constructor.
     */
    public function __construct(string $id = null, string $initialMaterial = null)
    {
        $solutionPrototype = [
            'annotations' => [],
            'videoCodes' => [],
            'cutList' => [],
            'material' => $initialMaterial,
        ];
        $this->solution = $solutionPrototype;
        $this->generateOrSetId($id);
        $this->update_timestamp = new DateTimeImmutable();
    }


    public function getSolution(): ?ServerSideSolutionData
    {
        return ServerSideSolutionData::fromArray($this->solution);
    }

    public function setSolution(ServerSideSolutionData $solutionData): self
    {
        $this->solution = $solutionData->toArray();

        return $this;
    }

    public function getUpdateTimestamp(): DateTimeImmutable
    {
        return $this->update_timestamp;
    }

    public function setUpdateTimestamp(DateTimeImmutable $update_timestamp): void
    {
        $this->update_timestamp = $update_timestamp;
    }

    public function getCutVideo(): ?Video
    {
        return $this->cutVideo;
    }

    public function setCutVideo(?Video $cutVideo): self
    {
        $this->cutVideo = $cutVideo;

        return $this;
    }
}
