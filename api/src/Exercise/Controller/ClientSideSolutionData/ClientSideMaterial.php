<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Exercise\ServerSideSolutionData\ServerSideMaterial;
use JsonSerializable;

/**
 * Client side represenation of material
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideMaterial implements JsonSerializable
{
    private string $id;
    private string $material;
    private string $solutionId;

    private function __construct(string $id, string $solutionId, string $material)
    {
        $this->id = $id;
        $this->material = $material;
        $this->solutionId = $solutionId;
    }

    public static function fromServerSideMaterial(ServerSideMaterial $material, string $solutionId): self
    {
        return new self(
            $solutionId . '_material',
            $solutionId,
            $material->toString()
        );
    }

    public static function fromArray(array $input): self
    {
        return new self(
            $input['id'],
            $input['solutionId'],
            $input['material'],
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'solutionId' => $this->solutionId,
            'material' => $this->material,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function getId(): string
    {
        return $this->id;
    }
}
