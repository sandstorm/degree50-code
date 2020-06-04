<?php

namespace App\Entity\Exercise;

use App\Core\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

/**
 * Material
 *
 * @ORM\Entity
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
     * @var string
     *
     * @ORM\Column(name="link", type="string", length=255)
     */
    private $link;

    /**
     * @var \DateTimeInterface|null
     *
     * @ORM\Column(name="uploadAt", type="datetime")
     */
    private $uploadAt;

    /**
     * NOTE: This is not a mapped field of entity metadata, just a simple property.
     * @var File
     *
     * @Vich\UploadableField(mapping="exercise_material", fileNameProperty="link")
     * @Assert\File(maxSize = "20M")
     */
    private $file;

    /**
     * @ORM\ManyToOne(targetEntity="ExercisePhase", inversedBy="material")
     * @ORM\JoinColumn(nullable=true)
     */
    private $exercisePhase;

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
     * @param string $link
     */
    public function setLink($link)
    {
        $this->link = $link;
    }

    /**
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * @ORM\PrePersist
     */
    public function setUploadedAtValue()
    {
        $this->uploadAt = new \DateTime();
    }

    /**
     * @return \DateTimeInterface
     */
    public function getUploadAt()
    {
        return $this->uploadAt;
    }

    /**
     * @param File|\Symfony\Component\HttpFoundation\File\UploadedFile $file
     */
    public function setFile(File $file = null): void
    {
        $this->file = $file;
        if (null !== $file) {
            $this->uploadAt = new \DateTime();
        }
    }

    /**
     * @return File|null
     */
    public function getFile(): ?File
    {
        return $this->file;
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
}
