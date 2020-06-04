<?php

namespace App\Entity\Video;

use App\Core\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoSubtitlesRepository")
 */
class VideoSubtitles
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="json")
     */
    private $subtitles = [];

    public function getSubtitles(): ?array
    {
        return $this->subtitles;
    }

    public function setSubtitles(array $subtitles): self
    {
        $this->subtitles = $subtitles;

        return $this;
    }
}
