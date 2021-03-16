<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Video\Video;
use JsonSerializable;

/**
 * Client side represenation of an encoded cut video.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideCutVideo implements JsonSerializable {
    private string $id;
    private string $name;
    private ?string $description;
    private ?float $duration;

    // TODO if we keep these, we should properly type them
    // currently we don't use/create subtitles, so it does not really matter.
    private array $subtitles;
    private ClientSideVideoUrl $url;

    private function __construct(
        string $id,
        string $name,
        ?string $description,
        ?float $duration,
        array $subtitles,
        ClientSideVideoUrl $url
    )
    {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->duration = $duration;
        $this->subtitles = $subtitles;
        $this->url = $url;
    }

    public static function fromVideoEntity(Video $video, ClientSideVideoUrl $url) {
        return new self(
            $video->getId(),
            $video->getTitle(),
            $video->getDescription(),
            $video->getVideoDuration(),
            $video->getSubtitles()->getSubtitles(),
            $url,
        );
    }

    public static function fromArray(array $input) {
        return new self(
            $input['id'],
            $input['name'],
            $input['description'],
            $input['duration'],
            $input['subtitles'],
            $input['url']
        );
    }

    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'duration' => $this->duration,
            'subtitles' => $this->subtitles,
            'url' => $this->url,
        ];
    }

    public function jsonSerialize() {
        return $this->toArray();
    }
}
