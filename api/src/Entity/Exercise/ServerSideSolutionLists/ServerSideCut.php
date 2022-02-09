<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

/**
 * Server side represenation of a cut.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideCut
{
    private string $start;
    private string $end;
    private string $text;
    private string $memo;
    private ?string $color;
    private string $url;
    private float $offset;
    private float $playbackRate;

    private function __construct(
        string $start,
        string $end,
        string $text,
        string $memo,
        ?string $color,
        string $url,
        float $offset,
        float $playbackRate
    )
    {
        $this->start = $start;
        $this->end = $end;
        $this->text = $text;
        $this->memo = $memo;
        $this->color = $color;
        $this->url = $url;
        $this->offset = $offset;
        $this->playbackRate = $playbackRate;
    }

    public static function fromArray(array $input): ServerSideCut
    {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
            $input['url'],
            $input['offset'],
            $input['playbackRate']
        );
    }

    public function toArray(): array
    {
        return [
            'start' => $this->start,
            'end' => $this->end,
            'text' => $this->text,
            'memo' => $this->memo,
            'color' => $this->color,
            'url' => $this->url,
            'offset' => $this->offset,
            'playbackRate' => $this->playbackRate
        ];
    }

    public function getStart(): string
    {
        return $this->start;
    }

    public function getEnd(): string
    {
        return $this->end;
    }

    public function getText(): string
    {
        return $this->text;
    }

    public function getMemo(): string
    {
        return $this->memo;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getOffset(): float
    {
        return $this->offset;
    }

    public function getPlaybackRate(): float
    {
        return $this->playbackRate;
    }
}

