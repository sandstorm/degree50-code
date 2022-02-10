<?php

namespace App\Entity\Exercise;

use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\User;
use App\Entity\VirtualizedFile;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
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
     * @ORM\Column(name="name", type="string", length=255)
     */
    private string $name = "";

    /**
     * @ORM\Embedded(class=VirtualizedFile::class)
     */
    private ?VirtualizedFile $uploadedFile;

    /**
     * @ORM\Column(name="mime_type", type="string", length=255)
     */
    private string $mimeType;

    /**
     * @ORM\Column(name="upload_at", type="datetimetz_immutable")
     */
    private ?DateTimeImmutable $uploadAt;

    /**
     * // TODO: inversedBy="createdVideos" -- is this a bug?
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="createdVideos")
     * @ORM\JoinColumn(nullable=false)
     */
    private User $creator;

    /**
     * @ORM\ManyToOne(targetEntity="ExercisePhase", inversedBy="material")
     * @ORM\JoinColumn(nullable=true)
     */
    private ?ExercisePhase $exercisePhase;

    /**
     * Material constructor.
     */
    public function __construct($id = null)
    {
        $this->generateOrSetId($id);
    }


    public function setName(string $name)
    {
        $this->name = $name;
    }

    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @ORM\PrePersist
     */
    public function setUploadedAtValue()
    {
        $this->uploadAt = new DateTimeImmutable();
    }

    public function getUploadAt(): ?DateTimeImmutable
    {
        return $this->uploadAt;
    }

    public function setExercisePhase(?ExercisePhase $exercisePhase)
    {
        $this->exercisePhase = $exercisePhase;
    }

    public function getExercisePhase(): ?ExercisePhase
    {
        return $this->exercisePhase;
    }

    public function setMimeType(string $mimeType): void
    {
        $this->mimeType = $mimeType;
    }

    public function getMimeType(): string
    {
        return $this->mimeType;
    }

    public function getCreator(): User
    {
        return $this->creator;
    }

    public function setCreator(User $creator): void
    {
        $this->creator = $creator;
    }

    public function getUploadedFile(): ?VirtualizedFile
    {
        return $this->uploadedFile;
    }

    public function setUploadedFile(VirtualizedFile $uploadedFile): void
    {
        $this->uploadedFile = $uploadedFile;
    }
}
