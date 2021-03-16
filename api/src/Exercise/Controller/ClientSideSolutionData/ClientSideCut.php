<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Exercise\ServerSideSolutionLists\ServerSideCut;
use JsonSerializable;

/**
 * Client side represenation of a cut.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideCut implements JsonSerializable {
    private string $id;
    private string $start;
    private string $end;
    private string $text;
    private string $memo;
    private ?string $color;
    private string $solutionId;
    private string $url;
    private float $offset;
    private float $playbackRate;

    private function __construct(
        string $start,
        string $end,
        string $text,
        string $memo,
        ?string $color,
        string $solutionId,
        string $url,
        float $offset,
        float $playbackRate,
        string $id
    )
    {
        $this->id = $id;
        $this->start = $start;
        $this->end = $end;
        $this->text = $text;
        $this->memo = $memo;
        $this->color = $color;
        $this->solutionId = $solutionId;
        $this->url = $url;
        $this->offset = $offset;
        $this->playbackRate = $playbackRate;
    }

    public static function fromServerSideCut(ServerSideCut $cut, string $solutionId, int $index) {
        return new self(
            $cut->getStart(),
            $cut->getEnd(),
            $cut->getText(),
            $cut->getMemo(),
            $cut->getColor(),
            $solutionId,
            $cut->getUrl(),
            $cut->getOffset(),
            $cut->getPlaybackRate(),
            $solutionId . '_' . $index
        );
    }

    public static function fromArray(array $input, int $index) {
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

    public function toArray(): array {
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

    public function jsonSerialize() {
        return $this->toArray();
    }

    public function getId() {
        return $this->id;
    }
}

