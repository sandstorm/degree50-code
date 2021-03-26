<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

/**
 * Server side represenation of a cut.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideCut {
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

    public static function fromArray(array $input) {
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

    public function toArray(): array {
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
      * Get start.
      */
     public function getStart()
     {
         return $this->start;
     }

     /**
      * Get end.
      */
     public function getEnd()
     {
         return $this->end;
     }

     /**
      * Get text.
      */
     public function getText()
     {
         return $this->text;
     }

     /**
      * Get memo.
      */
     public function getMemo()
     {
         return $this->memo;
     }

     /**
      * Get color.
      */
     public function getColor()
     {
         return $this->color;
     }

     /**
      * Get url.
      */
     public function getUrl()
     {
         return $this->url;
     }

    /**
     * Get offset.
     */
    public function getOffset()
    {
        return $this->offset;
    }

    /**
     * Get playbackRate.
     */
    public function getPlaybackRate()
    {
        return $this->playbackRate;
    }
}

