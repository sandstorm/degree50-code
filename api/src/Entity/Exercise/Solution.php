<?php

namespace App\Entity\Exercise;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideSolutionLists;
use App\Entity\Video\Video;
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
    private $solution;

    /**
     * @var \DateTimeImmutable|null
     *
     * @ORM\Column(type="datetimetz_immutable")
     */
    private $update_timestamp;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Video\Video", cascade={"remove"})
     */
    private $cutVideo;

    /**
     * Solution constructor.
     */
    public function __construct(string $id = null)
    {
        $solutionPrototype = [
            'annotations' => [],
            'videoCodes' => [],
            'cutList' => [],
        ];
        $this->solution = $solutionPrototype;
        $this->generateOrSetId($id);
        $this->update_timestamp = new \DateTimeImmutable();
    }


    public function getSolution(): ?ServerSideSolutionLists
    {
        return ServerSideSolutionLists::fromArray($this->solution);
    }

    public function setSolution(ServerSideSolutionLists $solutionLists): self
    {
        $this->solution = $solutionLists->toArray();

        return $this;
    }

    /**
     * @return \DateTimeImmutable|null
     */
    public function getUpdateTimestamp(): ?\DateTimeImmutable
    {
        return $this->update_timestamp;
    }

    /**
     * @param \DateTimeImmutable|null $update_timestamp
     */
    public function setUpdateTimestamp(?\DateTimeImmutable $update_timestamp): void
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
