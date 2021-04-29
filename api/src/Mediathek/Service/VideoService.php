<?php


namespace App\Mediathek\Service;


use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use App\Twig\AppRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * This service handles operations on video entities.
 */
class VideoService
{
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;
    private VideoRepository $videoRepository;
    private AppRuntime $appRuntime;
    private KernelInterface $kernel;
    private LoggerInterface $logger;

    const VIDEO_DOCTRINE_FILTER_NAME = 'video_doctrine_filter';

    public function __construct(
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        VideoRepository $videoRepository,
        AppRuntime $appRuntime,
        KernelInterface $kernel,
        LoggerInterface $logger
    )
    {
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->videoRepository = $videoRepository;
        $this->appRuntime = $appRuntime;
        $this->kernel = $kernel;
        $this->logger = $logger;
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

    /**
     * Removes a video entity along with its encoded video directory.
     */
    public function deleteVideo(Video $video)
    {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());
        $this->removeVideoFile($fileUrl);

        $this->eventStore->addEvent('VideoDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->remove($video);
        $this->entityManager->flush();
    }

    /**
     * This method removes the originally uploaded video file from the file system.
     * Note: This does not affect any encoded files.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function removeOriginalVideoFile(Video $video) {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getUploadedVideoFile());
        $filesystem = new Filesystem();
        $filesystem->remove($this->kernel->getProjectDir().$fileUrl);

        $video->setUploadedVideoFile(null);

        $this->eventStore->addEvent('VideoDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    /**
     * This method removes the originally uploaded subtitle file from the file system.
     * Note: This does not affect the subtitles.vtt file wich is created inside
     * the encoded_videos/<id> directory upon encoding!
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function removeOriginalSubtitleFile(Video $video) {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getUploadedSubtitleFile());
        $filesystem = new Filesystem();
        $filesystem->remove($this->kernel->getProjectDir().$fileUrl);

        $video->setUploadedSubtitleFile(null);

        $this->eventStore->addEvent('SubtitleDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    /**
     * Persists the an uploaded video file to the respective video and also sets some basic properties like <creator> and dataPrivacy properties.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function persistUploadedVideoFile(
        Video $video,
        VirtualizedFile $uploadedVideoFile,
        User $user
    ) {
        $video->setCreator($user);
        $video->setUploadedVideoFile($uploadedVideoFile);
        $video->setDataPrivacyAccepted(false);
        $video->setDataPrivacyPermissionsAccepted(false);

        $this->eventStore->addEvent('VideoUploaded', [
            'videoId' => $video->getId(),
            'uploadedVideoFile' => $video->getUploadedVideoFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    /**
     * Persists the an uploaded subtitle file to the respective video and also sets some basic properties like <creator> and dataPrivacy properties.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function persistUploadedSubtitleFile(
        Video $video,
        VirtualizedFile $uploadedSubtitleFile,
        User $user
    ) {
        $video->setCreator($user);
        $video->setUploadedSubtitleFile($uploadedSubtitleFile);
        $video->setDataPrivacyAccepted(false);
        $video->setDataPrivacyPermissionsAccepted(false);

        $this->eventStore->addEvent('SubtitleUploaded', [
            'videoId' => $video->getId(),
            'uploadedSubtitleFile' => $video->getUploadedSubtitleFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    private function removeVideoFile(string $fileUrl): void
    {
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';

        $filesystem = new Filesystem();
        $filesystem->remove($publicResourcesFolderPath . $fileUrl);
    }
}
