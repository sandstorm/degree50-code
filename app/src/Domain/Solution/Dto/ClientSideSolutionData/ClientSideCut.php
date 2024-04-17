<?php

namespace App\Domain\Solution\Dto\ClientSideSolutionData;

use JsonSerializable;

/**
 * Client side representation of a cut.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideCut implements JsonSerializable
{

    private function __construct(
        private readonly string  $start,
        private readonly string  $end,
        private readonly string  $text,
        private readonly string  $memo,
        private readonly ?string $color,
        private readonly string  $solutionId,
        private readonly string  $url,
        private readonly float   $offset,
        private readonly float   $playbackRate,
        private readonly string  $id
    )
    {
    }

    public static function fromServerSideCut(ServerSideCut $cut, string $solutionId, int $index): ClientSideCut
    {
        return new self(
            $cut->start,
            $cut->end,
            $cut->text,
            $cut->memo,
            $cut->color,
            $solutionId,
            $cut->url,
            $cut->offset,
            $cut->playbackRate,
            $solutionId . '_' . $index
        );
    }

    public static function fromArray(array $input, int $index): ClientSideCut
    {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
            $input['solutionId'],
            $input['url'],
            $input['offset'],
            $input['playbackRate'],
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
            'offset' => $this->offset,
            'url' => $this->url,
            'playbackRate' => $this->playbackRate,
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

