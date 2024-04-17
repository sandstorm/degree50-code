<?php

namespace App\Domain;

use App\Domain\EntityTraits\IdentityTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 */
class Fachbereich
{
    use IdentityTrait;

    /**
     * @var string
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    private string $name = '';

    public function __construct(?string $id = null)
    {
        $this->generateOrSetId($id);
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name): void
    {
        $this->name = $name;
    }
}
