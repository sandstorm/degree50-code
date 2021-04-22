<?php


namespace App\Mediathek\Controller;


use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use App\Twig\AppRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpKernel\KernelInterface;

class VideoService
{
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;
    private VideoRepository $videoRepository;
    private AppRuntime $appRuntime;
    private KernelInterface $kernel;

    const VIDEO_DOCTRINE_FILTER_NAME = 'video_doctrine_filter';

    public function __construct(EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore, VideoRepository $videoRepository, AppRuntime $appRuntime, KernelInterface $kernel)
    {
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->videoRepository = $videoRepository;
        $this->appRuntime = $appRuntime;
        $this->kernel = $kernel;
    }

    /**
     * @param User $user
     * @return Video[]
     */
    public function getVideosCreatedByUserWithoutFilters(User $user): array
    {
        $this->entityManager->getFilters()->disable(self::VIDEO_DOCTRINE_FILTER_NAME);
        $videos = $this->videoRepository->findBy(['creator' => $user]);
        $this->entityManager->getFilters()->enable(self::VIDEO_DOCTRINE_FILTER_NAME);

        return $videos;
    }

    public function deleteVideosCreatedByUser(User $user): void
    {
        $videosCreatedByUser = $this->getVideosCreatedByUserWithoutFilters($user);

        foreach ($videosCreatedByUser as $video) {
            $this->deleteVideo($video);
        }
    }

    public function deleteVideo(Video $video)
    {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());
        $this->removeVideoFile($fileUrl);

        $this->eventStore->addEvent('VideoDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        /**
         * Due to ORM cascading options the following things will also happen when we delete a Video:
         *
         *   1. The VideoSubtitles will be deleted @see Video::$subtitles
         */
        $this->entityManager->remove($video);
        $this->entityManager->flush();
    }

    private function removeVideoFile(string $fileUrl): void
    {
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';

        $filesystem = new Filesystem();
        $filesystem->remove($publicResourcesFolderPath . $fileUrl);
    }
}
