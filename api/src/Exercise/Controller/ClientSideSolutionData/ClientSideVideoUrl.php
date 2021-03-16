<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use JsonSerializable;

/**
 * Client side represenation of a videoUrl.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideVideoUrl implements JsonSerializable {
    private string $hls;
    private string $mp4;
    private string $vtt;

    private function __construct(
        string $hls,
        string $mp4,
        string $vtt
    )
    {
        $this->hls = $hls;
        $this->mp4 = $mp4;
        $this->vtt = $vtt;
    }

    public function jsonSerialize() {
        return $this->toArray();
    }

    public function toArray() {
        return [
            'hls' => $this->hls,
            'mp4' => $this->mp4,
            'vtt' => $this->vtt,
        ];
    }

    public static function fromBaseUrl(string $baseUrl) {
        return new self(
            $baseUrl . '/hls.m3u8',
            $baseUrl . '/x264.mp4',
            $baseUrl . '/subtitles.vtt'
        );
    }
}
