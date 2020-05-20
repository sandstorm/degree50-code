<?php

namespace App\Entity\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoCutListRepository")
 */
class VideoCutList
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="json")
     */
    private $cutList = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCutList(): ?array
    {
        return $this->cutList;
    }

    public function setCutList(array $cutList): self
    {
        $this->cutList = $cutList;

        return $this;
    }
}
