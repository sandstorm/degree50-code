<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCode;
use JsonSerializable;

/**
 * Client side representation of a videoCode.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideVideoCode implements JsonSerializable
{
    private string $id;
    private string $start;
    private string $end;
    private string $text;
    private string $memo;
    // TODO: Why optional?
    private ?string $color;
    private string $idFromPrototype;
    private string $solutionId;

    private function __construct(
        string $start,
        string $end,
        string $text,
        string $memo,
        ?string $color,
        string $idFromPrototype,
        string $solutionId,
        string $id
    )
    {
        $this->id = $id;
        $this->start = $start;
        $this->end = $end;
        $this->text = $text;
        $this->memo = $memo;
        $this->color = $color;
        $this->idFromPrototype = $idFromPrototype;
        $this->solutionId = $solutionId;
    }

    public static function fromServerSideVideoCode(ServerSideVideoCode $videoCode, string $solutionId, int $index): ClientSideVideoCode
    {
        return new self(
            $videoCode->getStart(),
            $videoCode->getEnd(),
            $videoCode->getText(),
            $videoCode->getMemo(),
            $videoCode->getColor(),
            $videoCode->getIdFromPrototype(),
            $solutionId,
            $solutionId . '_' . $index
        );
    }

    public static function fromArray(array $input, int $index): ClientSideVideoCode
    {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
            $input['solutionId'],
            $input['idFromPrototype'],
            $input['solutionId'] . '_' . $index
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'start' => $this->start,
            'end' => $this->end,
            'text' => $this->text,
            'memo' => $this->memo,
            'color' => $this->color,
            'idFromPrototype' => $this->idFromPrototype,
            'solutionId' => $this->solutionId,
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

