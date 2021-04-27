<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

/**
 * Server side representation of a videoCode.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideVideoCode {
    private string $start;
    private string $end;
    private string $text;
    private string $memo;
    // TODO: Why optional?
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

    /**
     * Create Entity from array.
     * This is used to read from persisted and clientSide JSON.
     */
    public static function fromArray(array $input): ServerSideVideoCode
    {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
            $input['idFromPrototype'],
        );
    }

    /**
     * Prepare to be persisted or sent to client as JSON
     */
    public function toArray(): array
    {
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
     public function getColor(): ?string
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
