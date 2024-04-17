<?php

namespace App\Domain\Exercise\Dto\ServerSideSolutionData;

/**
 * Server side representation of a videoCode.
 *
 * @see \App\Domain\Exercise\Dto\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideVideoCode
{
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

    public function getIdFromPrototype(): string
    {
        return $this->idFromPrototype;
    }
}
