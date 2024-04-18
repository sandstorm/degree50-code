<?php

namespace App\Mediathek\Dto;

use App\Domain\Video\Model\Video;

/**
 * Dto which contains video as well as its favorite status.
 */
class VideoWithFavoriteStatusDto
{
    private function __construct(
        // TODO: rename to $video
        private readonly Video $data,
        private readonly bool  $isFavorite
    )
    {
    }

    public static function create(Video $video, bool $isFavorite): VideoWithFavoriteStatusDto
    {
        return new self($video, $isFavorite);
    }

    public function getData(): Video
    {
        return $this->data;
    }

    public function getIsFavorite(): bool
    {
        return $this->isFavorite;
    }
}
