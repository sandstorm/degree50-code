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
    private ?string $description;
    private ?float $duration;

    private ClientSideVideoUrl $url;

    private function __construct(
        string $id,
        string $name,
        ?string $description,
        ?float $duration,
        ClientSideVideoUrl $url
    )
    {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->duration = $duration;
        $this->url = $url;
    }

    public static function fromVideoEntity(Video $video, ClientSideVideoUrl $url): ClientSideCutVideo
    {
        return new self(
            $video->getId(),
            $video->getTitle(),
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
