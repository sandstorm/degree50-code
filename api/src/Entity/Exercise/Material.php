<?php

namespace App\Entity\Exercise;

use App\Core\EntityTraits\IdentityTrait;
use App\Entity\VirtualizedFile;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

/**
 * Material
 *
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\MaterialRepository")
 * @ORM\HasLifecycleCallbacks()
 * @Vich\Uploadable
 */
class Material
{
    use IdentityTrait;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name = "";

    /**
     * @ORM\Embedded(class=VirtualizedFile::class)
     */
    private ?VirtualizedFile $uploadedFile;

    /**
     * @var string
     *
     * @ORM\Column(name="mime_type", type="string", length=255)
     */
    private $mimeType;

    /**
     * @var \DateTimeImmutable|null
     *
     * @ORM\Column(name="upload_at", type="datetimetz_immutable")
     */
    private $uploadAt;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="createdVideos")
     * @ORM\JoinColumn(nullable=false)
     */
    private $creator;

    /**
     * @ORM\ManyToOne(targetEntity="ExercisePhase", inversedBy="material")
     * @ORM\JoinColumn(nullable=true)
     */
    private $exercisePhase;

    /**
     * Material constructor.
     */
    public function __construct($id = null)
    {
        $this->generateOrSetId($id);
    }


    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @ORM\PrePersist
     */
    public function setUploadedAtValue()
    {
        $this->uploadAt = new \DateTimeImmutable();
    }

    /**
     * @return \DateTimeImmutable
     */
    public function getUploadAt()
    {
        return $this->uploadAt;
    }

    /**
     * @param ExercisePhase $exercisePhase
     */
    public function setExercisePhase(ExercisePhase $exercisePhase)
    {
        $this->exercisePhase = $exercisePhase;
    }

    /**
     * @return ExercisePhase
     */
    public function getExercisePhase()
    {
        return $this->exercisePhase;
    }

    /**
     * @param string $mimeType
     */
    public function setMimeType(string $mimeType): void
    {
        $this->mimeType = $mimeType;
    }

    /**
     * @return string
     */
    public function getMimeType(): string
    {
        return $this->mimeType;
    }

    /**
     * @return mixed
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * @param mixed $creator
     */
    public function setCreator($creator): void
    {
        $this->creator = $creator;
    }

    /**
     * @return ?VirtualizedFile
     */
    public function getUploadedFile(): ?VirtualizedFile
    {
        return $this->uploadedFile;
    }

    /**
     * @param VirtualizedFile $uploadedFile
     */
    public function setUploadedFile(VirtualizedFile $uploadedFile): void
    {
        $this->uploadedFile = $uploadedFile;
    }
}
