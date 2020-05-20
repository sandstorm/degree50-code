<?php

namespace App\Entity\Video;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoSubtitlesRepository")
 */
class VideoSubtitles
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
    private $subtitles = [];

    public function getId(): ?int
    {
        return $this->id;
    }

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
