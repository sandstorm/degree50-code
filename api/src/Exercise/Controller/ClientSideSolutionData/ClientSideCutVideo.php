<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Video\Video;
use JsonSerializable;

/**
 * Client side represenation of an encoded cut video.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideCutVideo implements JsonSerializable
{
    private string $id;
    private string $name;
    private string $createdAt;
    private ?string $description;
    private ?float $duration;

    private ClientSideVideoUrl $url;

    private function __construct(
        string $id,
        string $name,
        string $createdAt,
        ?string $description,
        ?float $duration,
        ClientSideVideoUrl $url
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->createdAt = $createdAt;
        $this->description = $description;
        $this->duration = $duration;
        $this->url = $url;
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
