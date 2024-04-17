<?php

namespace App\Domain;

use App\Core\EntityTraits\IdentityTrait;
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

    public function __construct(?string $id = null)
    {
        $this->generateOrSetId($id);
    }
}
