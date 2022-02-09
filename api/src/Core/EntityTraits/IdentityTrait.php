<?php


namespace App\Core\EntityTraits;


use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

trait IdentityTrait
{
    /**
     * The entity Id
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\Column(type="guid")
     */
    private string $id;

    private function generateOrSetId(?string $id = null)
    {
        $this->id = $id ?: Uuid::uuid4()->toString();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function __construct(?string $id = null)
    {
        $this->generateOrSetId($id);
    }
}
