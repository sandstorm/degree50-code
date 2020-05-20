<?php

namespace App\Entity\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use App\Entity\VirtualizedFile;
use Doctrine\ORM\Mapping as ORM;
/**
 * @ApiResource
 * @ORM\Entity
 */
class Video
{

    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\Column(type="guid")
     */
    private string $id;

    /**
     * @ORM\Column(type="text")
     * @ApiFilter(SearchFilter::class, strategy="ipartial")
     */
    private string $title = '';

    /**
     * @ORM\Column(type="text")
     */
    private string $description = '';

    /**
     * @ORM\Embedded(class=VirtualizedFile::class)
     */
    private ?VirtualizedFile $uploadedVideoFile;

    /**
     * @ORM\Embedded(class=VirtualizedFile::class)
     */
    private ?VirtualizedFile $encodedVideoDirectory;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Video\VideoSubtitles", cascade={"persist", "remove"})
     */
    private $subtitles;

    /**
     * Video constructor.
     * @param string $id
     */
    public function __construct(string $id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * @param string $description
     */
    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    /**
     * @return ?VirtualizedFile
     */
    public function getUploadedVideoFile(): ?VirtualizedFile
    {
        return $this->uploadedVideoFile;
    }

    /**
     * @param VirtualizedFile $uploadedVideoFile
     */
    public function setUploadedVideoFile(VirtualizedFile $uploadedVideoFile): void
    {
        $this->uploadedVideoFile = $uploadedVideoFile;
    }

    /**
     * @return ?VirtualizedFile
     */
    public function getEncodedVideoDirectory(): ?VirtualizedFile
    {
        return $this->encodedVideoDirectory;
    }

    /**
     * @param VirtualizedFile $encodedVideoDirectory
     */
    public function setEncodedVideoDirectory(VirtualizedFile $encodedVideoDirectory): void
    {
        $this->encodedVideoDirectory = $encodedVideoDirectory;
    }

    public function getSubtitles(): ?VideoSubtitles
    {
        return $this->subtitles;
    }

    public function setSubtitles(?VideoSubtitles $subtitles): self
    {
        $this->subtitles = $subtitles;

        return $this;
    }
}
