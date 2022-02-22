<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCodePrototype;
use JsonSerializable;

/**
 * Client side representation of a videoCodePrototype.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideVideoCodePrototype implements JsonSerializable
{
    private string $id;
    private string $name;
    private string $color;
    private array $childClientSidePrototypes;
    private ?string $parentId;
    private bool $userCreated;

    private function __construct(
        string $id,
        string $name,
        string $color,
        array $childClientSidePrototypes,
        ?string $parentId,
        bool $userCreated
    )
    {
        $this->id = $id;
        $this->name = $name;
        $this->color = $color;
        $this->childClientSidePrototypes = $childClientSidePrototypes;
        $this->parentId = $parentId;
        $this->userCreated = $userCreated;
    }

    public static function fromServerSideVideoCodePrototype(ServerSideVideoCodePrototype $videoCodePrototype): ClientSideVideoCodePrototype
    {
        $childClientSidePrototypes = array_map(function ($serverSidePrototype) {
            return self::fromServerSideVideoCodePrototype($serverSidePrototype);
        }, $videoCodePrototype->getChildServerSidePrototypes());

        return new self(
            $videoCodePrototype->getId(),
            $videoCodePrototype->getName(),
            $videoCodePrototype->getColor(),
            $childClientSidePrototypes,
            $videoCodePrototype->getParentId(),
            $videoCodePrototype->getUserCreated(),
        );
    }

    public static function fromArray(array $input): ClientSideVideoCodePrototype
    {
        $childClientSidePrototypes = array_map(function ($prototype) {
            return self::fromArray($prototype);
        }, $input['videoCodes']); // => FIXME rename as soon as base refactoring is complete

        return new self(
            $input['id'],
            $input['name'],
            $input['color'],
            $childClientSidePrototypes,
            $input['parentId'],
            $input['userCreated']
        );
    }

    public function toArray(): array
    {
        $childPrototypes = array_map(function ($clientSidePrototype) {
            return $clientSidePrototype->toArray();
        }, $this->childClientSidePrototypes);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'videoCodes' => $childPrototypes, // => FIXME rename 'videoCodes' as soon as base refactoring is complete
            'parentId' => $this->parentId,
            'userCreated' => $this->userCreated,
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

