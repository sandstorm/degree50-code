<?php

namespace App\Entity\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoCutListRepository")
 */
class VideoCutList
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="json")
     */
    private $cutList = [];

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
