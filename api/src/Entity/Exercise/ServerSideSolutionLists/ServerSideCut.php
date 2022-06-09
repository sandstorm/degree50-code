<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

use App\VideoEncoding\TimeCode;

/**
 * Server side representation of a cut.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideCut
{
    public readonly string $start;
    public readonly string $end;
    public readonly string $text;
    public readonly string $memo;
    public readonly ?string $color;
    public readonly string $url;
    public readonly float $offset;
    public readonly float $playbackRate;

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

    /**
     * Get the duration (length) of the cut in seconds with milliseconds.
     *
     * @return float
     */
    public function getDuration(): float
    {
        return TimeCode::fromTimeString($this->end)->toFloat() - TimeCode::fromTimeString($this->start)->toFloat();
    }
}

