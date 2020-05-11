<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
/**
 * @ApiResource
 * @ORM\Entity
 */
class Video
{

    /**
     * @var string The entity Id
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="UUID")
     * @ORM\Column(type="guid")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @var string
     */
    private $video;

    /**
     * @ORM\Column(type="datetime")
     * @var \DateTime
     */
    private $updatedAt;

    /**
     * @return string
     */
    public function getVideo(): ?string
    {
        return $this->video;
    }

    /**
     * @param string $video
     */
    public function setVideo(?string $video): void
    {
        $this->video = $video;
    }

    /**
     * @return File
     */
    public function getVideoFile(): ?File
    {
        return $this->videoFile;
    }

    /**
     * @param File $videoFile
     */
    public function setVideoFile(File $videoFile): void
    {
        $this->videoFile = $videoFile;

        // VERY IMPORTANT:
        // It is required that at least one field changes if you are using Doctrine,
        // otherwise the event listeners won't be called and the file is lost
        if ($videoFile) {
            // if 'updatedAt' is not defined in your entity, use another property
            $this->updatedAt = new \DateTime('now');
        }
    }

    public function getId(): ?string
    {
        return $this->id;
    }
}
