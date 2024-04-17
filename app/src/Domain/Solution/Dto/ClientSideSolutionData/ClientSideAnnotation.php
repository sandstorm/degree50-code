<?php

namespace App\Domain\Exercise\Dto\ClientSideSolutionData;

use App\Domain\Exercise\Dto\ServerSideSolutionData\ServerSideAnnotation;
use JsonSerializable;

/**
 * Client side represenation of an annotation.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideAnnotation implements JsonSerializable
{
    private function __construct(
        private readonly string  $start,
        private readonly string  $end,
        private readonly string  $text,
        private readonly string  $memo,
        private readonly ?string $color,
        private readonly string  $solutionId,
        private readonly string  $id
    )
    {
    }

    public static function fromServerSideAnnotation(ServerSideAnnotation $annotation, string $solutionId, int $index): ClientSideAnnotation
    {
        return new self(
            $annotation->getStart(),
            $annotation->getEnd(),
            $annotation->getText(),
            $annotation->getMemo(),
            $annotation->getColor(),
            $solutionId,
            $solutionId . '_' . $index
        );
    }

    public static function fromArray(array $input, int $index): ClientSideAnnotation
    {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
            $input['solutionId'],
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

