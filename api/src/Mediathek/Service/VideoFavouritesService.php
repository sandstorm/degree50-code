<?php

namespace App\Mediathek\Service;

use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Entity\Video\VideoFavorite;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoFavoritesRepository;
use Doctrine\ORM\EntityManagerInterface;

class VideoFavouritesService
{
    private EntityManagerInterface $entityManager;
    private VideoFavoritesRepository $videoFavoritesRepository;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        VideoFavoritesRepository $videoFavoritesRepository,
    ) {
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->videoFavoritesRepository = $videoFavoritesRepository;
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
