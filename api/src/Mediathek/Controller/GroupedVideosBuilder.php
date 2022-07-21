<?php

namespace App\Mediathek\Controller;

use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Mediathek\Controller\Dto\VideoWithFavoriteStatusDto;
use App\Mediathek\Service\VideoFavouritesService;

class GroupedVideosBuilder
{
    private VideoFavouritesService $videoFavouritesService;
    private User $user;

    private array $ownVideos = [];
    private array $otherVideos = [];

    function __construct(VideoFavouritesService $videoFavouritesService)
    {
        $this->videoFavouritesService = $videoFavouritesService;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
    }

    public function addOwnVideo(Video $video)
    {
        array_push(
            $this->ownVideos,
            VideoWithFavoriteStatusDto::create($video, $this->videoFavouritesService->videoIsFavorite($video, $this->user))
        );

        return $this;
    }

    public function addOtherVideo(Video $video)
    {
        array_push(
            $this->otherVideos,
            VideoWithFavoriteStatusDto::create($video, $this->videoFavouritesService->videoIsFavorite($video, $this->user))
        );

        return $this;
    }

    public function create()
    {
        return [
            [
                'id' => 'ownVideos',
                'videos' => $this->ownVideos
            ],
            [
                'id' => 'otherVideos',
                'videos' => $this->otherVideos
            ]
        ];
    }
}
