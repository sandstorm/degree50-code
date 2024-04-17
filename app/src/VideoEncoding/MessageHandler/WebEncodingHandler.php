<?php


namespace App\VideoEncoding\MessageHandler;


use App\Core\FileSystemService;
use App\Domain\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Mediathek\Controller\VideoUploadController;
use App\Mediathek\Service\VideoService;
use App\Repository\Video\VideoRepository;
use App\VideoEncoding\Message\WebEncodingTask;
use App\VideoEncoding\Service\EncodingService;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use League\Flysystem\FileExistsException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

/**
 * Encodes freshly uploaded videos
 * @see VideoUploadController
 *
 * NOTE: If you make changes to a handler you need to manually stop the worker and restart it,
 * to apply and test the changes.
 *
 * Stop workers:
 * ./symfony-console messenger:stop-workers
 *
 * Start workers:
 * ./symfony-console messenger:consume async -vv
 * Note: the -v|-vv|-vvv option determines the log level
 */
class WebEncodingHandler implements MessageHandlerInterface
{

    public function __construct(
        private readonly LoggerInterface              $logger,
        private readonly FileSystemService            $fileSystemService,
        private readonly VideoRepository              $videoRepository,
        private readonly EntityManagerInterface       $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly VideoService                 $videoService,
        private readonly EncodingService              $encodingService,
    )
    {
    }


    public function __invoke(WebEncodingTask $encodingTask)
    {
        $this->logger->warning("WebEncodingHandler Line 64: filter enabled = " . $this->entityManager->getFilters()->isEnabled('video_doctrine_filter'));
        if ($this->entityManager->getFilters()->isEnabled('video_doctrine_filter')) {
            $this->entityManager->getFilters()->disable('video_doctrine_filter');
        } else {
            $this->logger->warning('WebEncodingHandler Line 66: Trying to disable "video_doctrine_filter" but this filter is not enabled at this point. This means that we probably have a race condition where some part of the application disables doctrine filters while other parts enable them almost simultaneously');
        }

        $video = $this->videoRepository->find($encodingTask->getVideoId());

        try {
            if ($video === null) {
                $this->logger->warning('Video not found for encoding', ['videoId' => $encodingTask->getVideoId()]);
                if ($this->entityManager->getFilters()->isEnabled('video_doctrine_filter')) {
                    $this->logger->warning('WebEncodingHandler Line 76: Doctrine Filter already enabled again! This means that we probably have a race condition where some part of the application disables doctrine filters while other parts enable them almost simultaneously');
                }
                throw new Exception('Video not found for encoding', ['videoId' => $encodingTask->getVideoId()]);
            }

            $video->setEncodingStatus(Video::ENCODING_STARTED);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->persist($video);
            $this->entityManager->flush();

            $outputDirectory = $this->fileSystemService->generateUniqueTemporaryDirectory();
            $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

            $this->encodingService->encodeMP4WithAudioDescription($video, $localOutputDirectory);

            // We use our encoded mp4 file as baseline for further encoding to HLS
            // That way we can guarantee that the resulting HLS will be playable.
            $mp4Url = $localOutputDirectory . '/x264.mp4';
            $videoDuration = $this->encodingService->probeForVideoDuration($mp4Url);
            $this->encodingService->encodeHLS($mp4Url, $localOutputDirectory);

            $this->encodingService->createPreviewImage($mp4Url, $localOutputDirectory, $videoDuration);

            if (!empty($video->getUploadedSubtitleFile()->getVirtualPathAndFilename())) {
                $this->copyUploadedSubtitleFileToOutputDirectory($video, $localOutputDirectory);
            } else {
                $this->createEmptyDefaultSubtitlesFile($localOutputDirectory);
            }

            $video->setVideoDuration($videoDuration);
            $video->setEncodingStatus(Video::ENCODING_FINISHED);

            $this->eventStore->addEvent('VideoEncodedCompletely', [
                'videoId' => $video->getId(),
                'encodedVideoDirectory' => $encodingTask->getDesiredOutputDirectory()->getVirtualPathAndFilename(),
            ]);

            $this->fileSystemService->moveDirectory($outputDirectory, $encodingTask->getDesiredOutputDirectory());

            $video->setEncodedVideoDirectory($encodingTask->getDesiredOutputDirectory());

            $this->pingAndReconnectDB();

            // Remove intermediate uploaded files to save disc space
            $this->videoService->removeOriginalSubtitleFile($video);
            $this->videoService->removeOriginalAudioDescriptionFile($video);
            $this->videoService->removeOriginalVideoFile($video);

            $this->entityManager->persist($video);
            $this->entityManager->flush();
        } catch (Exception $exception) {
            $video->setEncodingStatus(Video::ENCODING_ERROR);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->persist($video);
            $this->entityManager->flush();
        } finally {
            // Disabling the filter happens globally and not on a per request basis.
            // Therefore we have to re-enable the filter after we are done encoding.
            if (!$this->entityManager->getFilters()->isEnabled('video_doctrine_filter')) {
                $this->entityManager->getFilters()->enable('video_doctrine_filter');
            }

            // WHY: chown output directory recursively because they're created as root by encoder process
            shell_exec('chown -R www-data:www-data ' . $this->fileSystemService->localPath($video->getEncodedVideoDirectory()));
        }
    }

    /**
     * @throws FileExistsException
     */
    private function copyUploadedSubtitleFileToOutputDirectory(Video $video, $localOutputDirectory)
    {
        $uploadedFilePath = $this->fileSystemService->fetchIfNeededAndGetLocalPath($video->getUploadedSubtitleFile());
        $destinationPath = $localOutputDirectory . '/subtitles.vtt';
        copy($uploadedFilePath, $destinationPath);
    }

    private function createEmptyDefaultSubtitlesFile($localOutputDirectory)
    {
        $path = $localOutputDirectory . '/subtitles.vtt';

        file_put_contents($path, '');
    }

    private function pingAndReconnectDB()
    {
        // WHY: The encoding process might take quite long and the db connection might have been
        // lost/closed in the meantime. Therefore we check if we still have a connection and
        // otherwise reconnect.
        if ($this->entityManager->getConnection()->ping() === false) {
            $this->entityManager->getConnection()->close();
            $this->entityManager->getConnection()->connect();
        }
    }
}
