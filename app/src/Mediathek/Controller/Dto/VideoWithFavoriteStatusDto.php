<?php

namespace App\Mediathek\Controller\Dto;

use App\Entity\Video\Video;

/**
 * Dto which contains video as well as its favorite status.
 */
class VideoWithFavoriteStatusDto
{
    private function __construct(
        private readonly Video $data,
        private readonly bool  $isFavorite
    )
    {
    }

    public static function create(Video $video, bool $isFavorite)
    {
        return new self($video, $isFavorite);
    }

    public function getData()
    {
        return $this->data;
    }

    public function getIsFavorite()
    {
        return $this->isFavorite;
    }
}
