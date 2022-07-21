<?php

namespace App\Mediathek\Controller\Dto;

use App\Entity\Video\Video;

/**
 * Dto which contains video as well as its favorite status.
 */
class VideoWithFavoriteStatusDto
{
    private Video $data;
    private bool $isFavorite;

    public static function create(Video $video, bool $isFavorite)
    {
        return new self($video, $isFavorite);
    }

    private function __construct(Video $data, bool $isFavorite)
    {
        $this->data = $data;
        $this->isFavorite = $isFavorite;
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
