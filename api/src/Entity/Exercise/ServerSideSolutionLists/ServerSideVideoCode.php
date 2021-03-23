<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

/**
 * Server side represenation of a videoCode.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideVideoCode {
    private string $start;
    private string $end;
    private string $text;
    private string $memo;
    private ?string $color;
    private string $idFromPrototype;

    private function __construct(string $start, string $end, string $text, string $memo, ?string $color, string $idFromPrototype)
    {
        $this->start = $start;
        $this->end = $end;
        $this->text = $text;
        $this->memo = $memo;
        $this->color = $color;
        $this->idFromPrototype = $idFromPrototype;
    }

    public static function fromArray(array $input) {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
            $input['idFromPrototype'],
        );
    }

    public function toArray(): array {
        return [
            'start' => $this->start,
            'end' => $this->end,
            'text' => $this->text,
            'memo' => $this->memo,
            'color' => $this->color,
            'idFromPrototype' => $this->idFromPrototype,
        ];
    }

     /**
      * Get start.
      *
      */
     public function getStart()
     {
         return $this->start;
     }

     /**
      * Get end.
      *
      */
     public function getEnd()
     {
         return $this->end;
     }

     /**
      * Get text.
      *
      */
     public function getText()
     {
         return $this->text;
     }

     /**
      * Get memo.
      *
      */
     public function getMemo()
     {
         return $this->memo;
     }

     /**
      * Get color.
      *
      */
     public function getColor()
     {
         return $this->color;
     }

     /**
      * Get idFromPrototype.
      *
      */
     public function getIdFromPrototype()
     {
         return $this->idFromPrototype;
     }
}
