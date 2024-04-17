<?php

namespace App\Mediathek\Service;

use App\Domain\Account\User;
use App\Domain\Video\Video;
use App\Domain\Video\VideoFavorite;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoFavoritesRepository;
use Doctrine\ORM\EntityManagerInterface;

class VideoFavouritesService
{

    public function __construct(
        private readonly EntityManagerInterface       $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly VideoFavoritesRepository     $videoFavoritesRepository,
    )
    {
    }

    public function videoIsFavorite(Video $video, User $user): bool
    {
        $maybeFavorite = $this->videoFavoritesRepository->findOneByUserAndVideo($user, $video);

        if (!is_null($maybeFavorite)) {
            return true;
        } else {
            return false;
        }
    }

    public function toggleFavorite(Video $video, User $user)
    {
        $maybeFavorite = $this->videoFavoritesRepository->findOneByUserAndVideo($user, $video);

        if (!is_null($maybeFavorite)) {
            $this->removeVideoFavorite($maybeFavorite);
        } else {
            $this->addVideoFavouriteForUser($video, $user);
        }
    }

    public function deleteFavoriteVideosByUser(User $user): void
    {
        $videoFavorites = $this->videoFavoritesRepository->findByUser($user);

        foreach ($videoFavorites as $videoFavorite) {
            $this->removeVideoFavorite($videoFavorite);
        }
    }

    public function removeVideoFavorite(VideoFavorite $videoFavorite)
    {
        $this->eventStore->addEvent('VideoFavoriteRemoved', [
            'videoFavoriteId' => $videoFavorite->getId(),
        ]);

        $this->entityManager->remove($videoFavorite);
        $this->entityManager->flush();
    }

    /**
     * @param User $user
     * @return Video[]
     */
    public function getFavouriteVideosForUser(User $user): array
    {
        return $this->videoFavoritesRepository->findByUser($user);
    }

    /**
     * @param Video $video
     * @param User $user
     */
    public function addVideoFavouriteForUser(Video $video, User $user): void
    {
        $newFavorite = new VideoFavorite($user, $video);

        $this->eventStore->addEvent('VideoFavorited', [
            'videoId' => $video->getId(),
            'userId' => $user->getId(),
        ]);

        $this->entityManager->persist($newFavorite);
        $this->entityManager->flush();
    }

    public function removeVideoFavoritesOfVideo(Video $video): void
    {
        $this->videoFavoritesRepository->removeAllWithVideo($video);
    }
}
