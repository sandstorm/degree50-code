<?php

namespace App\Domain\Exercise\Dto\ClientSideSolutionData;

use App\Domain\Video\Video;
use JsonSerializable;

/**
 * Client side represenation of an encoded cut video.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideCutVideo implements JsonSerializable
{

    private function __construct(
        private readonly string             $id,
        private readonly string             $name,
        private readonly string             $createdAt,
        private readonly ?string            $description,
        private readonly ?float             $duration,
        private readonly ClientSideVideoUrl $url
    )
    {
    }

    public static function fromVideoEntity(Video $video, ClientSideVideoUrl $url): ClientSideCutVideo
    {
        return new self(
            $video->getId(),
            $video->getTitle(),
            $video->getCreatedAt()->format("d.m.Y"),
            $video->getDescription(),
            $video->getVideoDuration(),
            $url,
        );
    }

    public static function fromArray(array $input): ClientSideCutVideo
    {
        return new self(
            $input['id'],
            $input['name'],
            $input['createdAt'],
            $input['description'],
            $input['duration'],
            $input['url']
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'createdAt' => $this->createdAt,
            'description' => $this->description,
            'duration' => $this->duration,
            'url' => $this->url,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
