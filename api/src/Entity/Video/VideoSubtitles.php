<?php

namespace App\Entity\Video;

use App\Core\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoSubtitlesRepository")
 *
 * @deprecated This will be removed in the next version of this platform
 */
class VideoSubtitles
{
    use IdentityTrait;

    /**
     * @ORM\Column(type="json")
     */
    private array $subtitles = [];

    public function getSubtitles(): array
    {
        return $this->subtitles;
    }

    public function setSubtitles(array $subtitles): self
    {
        $this->subtitles = $subtitles;

        return $this;
    }
}
