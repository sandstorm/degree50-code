<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

/**
 * Server side represenation of an annotation.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideAnnotation {
    private string $start;
    private string $end;
    private string $text;
    private string $memo;
    private ?string $color;

    public function getStart() {
        return $this->start;
    }

    public function getEnd() {
        return $this->end;
    }

    public function getText() {
        return $this->text;
    }

    public function getMemo() {
        return $this->memo;
    }

    public function getColor() {
        return $this->color;
    }

    private function __construct(string $start, string $end, string $text, string $memo, ?string $color)
    {
        $this->start = $start;
        $this->end = $end;
        $this->text = $text;
        $this->memo = $memo;
        $this->color = $color;
    }

    public static function fromArray(array $input) {
        return new self(
            $input['start'],
            $input['end'],
            $input['text'],
            $input['memo'],
            $input['color'],
        );
    }

    public function toArray(): array {
        return [
            'start' => $this->start,
            'end' => $this->end,
            'text' => $this->text,
            'memo' => $this->memo,
            'color' => $this->color,
        ];
    }
}
