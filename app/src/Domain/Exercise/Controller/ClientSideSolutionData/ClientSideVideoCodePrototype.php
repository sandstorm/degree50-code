<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Exercise\ServerSideSolutionData\ServerSideVideoCodePrototype;
use JsonSerializable;

/**
 * Client side representation of a videoCodePrototype.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideVideoCodePrototype implements JsonSerializable
{

    private function __construct(
        private readonly string  $id,
        private readonly string  $name,
        private readonly string  $color,
        private readonly array   $childClientSidePrototypes,
        private readonly ?string $parentId,
        private readonly bool    $userCreated
    )
    {
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

