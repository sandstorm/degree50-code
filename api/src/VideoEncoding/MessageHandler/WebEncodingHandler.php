<?php


namespace App\VideoEncoding\MessageHandler;


use App\Core\FileSystemService;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Mediathek\Controller\VideoUploadController;
use App\Mediathek\Service\VideoService;
use App\Repository\Video\VideoRepository;
use App\VideoEncoding\Message\WebEncodingTask;
use Doctrine\ORM\EntityManagerInterface;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\Format\Video\X264;
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
 * ./symfony-console messenger:consume async -vV
 */
class WebEncodingHandler implements MessageHandlerInterface
{
    private LoggerInterface $logger;
    private FileSystemService $fileSystemService;
    private VideoRepository $videoRepository;
    private VideoService $videoService;
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(
        LoggerInterface $logger,
        FileSystemService $fileSystemService,
        VideoRepository $videoRepository,
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        VideoService $videoService
    )
    {
        $this->logger = $logger;
        $this->fileSystemService = $fileSystemService;
        $this->videoRepository = $videoRepository;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->videoService = $videoService;
    }


    public function __invoke(WebEncodingTask $encodingTask)
    {
        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $video = $this->videoRepository->find($encodingTask->getVideoId());
        if ($video === null) {
            $this->logger->warning('Video not found for encoding', ['videoId' => $encodingTask->getVideoId()]);
            return;
        }

        try {
            $video->setEncodingStatus(Video::ENCODING_STARTED);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->persist($video);
            $this->entityManager->flush();

            $inputVideoFilename = $this->fileSystemService->fetchIfNeededAndGetLocalPath($video->getUploadedVideoFile());

            $config = [
                'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
                'timeout' => 3600, // The timeout for the underlying process
                'ffmpeg.threads' => 12,   // The number of threads that FFmpeg should use
            ];

            $outputDirectory = $this->fileSystemService->generateUniqueTemporaryDirectory();
            $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

            $this->encodeMP4($config, $inputVideoFilename, $localOutputDirectory);

            // We use our encoded mp4 file as baseline for further encoding to HLS
            // That way we can guarantee that the resulting HLS will be playable.
            $mp4Url = $localOutputDirectory . '/x264.mp4';
            $videoDuration = $this->probeForVideoDuration($mp4Url);
            $this->encodeHLS($config, $mp4Url, $localOutputDirectory);

            $this->createPreviewImage($config, $mp4Url, $localOutputDirectory, $videoDuration);

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
            $this->videoService->removeOriginalVideoFile($video);

            $this->entityManager->persist($video);
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $video->setEncodingStatus(Video::ENCODING_ERROR);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->persist($video);
            $this->entityManager->flush();
        } finally {
            // Disabling the filter happens globally and not on a per request basis.
            // Therefore we have to re-enable the filter after we are done encoding.
            $this->entityManager->getFilters()->enable('video_doctrine_filter');

            // WHY: chown output directory recursively because they're created as root by encoder process
            shell_exec('chown -R www-data:www-data ' . $this->fileSystemService->localPath($video->getEncodedVideoDirectory()));
        }
    }

    private function probeForVideoDuration(string $filePath): float
    {
        $ffprobe = FFProbe::create();
        $duration = $ffprobe
            ->format($filePath) // extracts file information
            ->get('duration');

        return $duration;
    }

    private function encodeMP4(array $config, string $inputVideoFilename, string $localOutputDirectory)
    {
        $this->logger->info('Start encoding MP4 of file <' . $inputVideoFilename . '>',);

        $ffmpeg = FFMpeg::create($config, $this->logger);
        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);
        $ffmpegVideo->save(new X264('libmp3lame'), $localOutputDirectory . '/x264.mp4');

        $this->logger->info('Finished encoding MP4 of file <' . $inputVideoFilename . '>',);
    }

    private function copyUploadedSubtitleFileToOutputDirectory(Video $video, $localOutputDirectory) {
        $uploadedFilePath = $this->fileSystemService->fetchIfNeededAndGetLocalPath($video->getUploadedSubtitleFile());
        $destinationPath = $localOutputDirectory . '/subtitles.vtt';
        copy($uploadedFilePath, $destinationPath);
    }

    private function createEmptyDefaultSubtitlesFile($localOutputDirectory) {
        $path = $localOutputDirectory . '/subtitles.vtt';

        file_put_contents($path, '');
    }

    private function encodeHLS(array $config, string $inputVideoFilename, string $localOutputDirectory)
    {
        $this->logger->info('Start encoding HLS of file <' . $inputVideoFilename . '>',);

        $ffmpeg = \Streaming\FFMpeg::create($config, $this->logger);

        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);

        $ffmpegVideo->hls()
            ->fragmentedMP4()
            ->x264()
            ->autoGenerateRepresentations([720, 360]) // You can limit the number of representatons
            ->save($localOutputDirectory . '/hls.m3u8');

        $this->logger->info('Finished encoding HLS of file <' . $inputVideoFilename . '>',);

    }

    private function createPreviewImage(array $config, string $inputVideoFilename, string $localOutputDirectory, float $videoDuration)
    {
        $this->logger->info('Create preview image for <' . $inputVideoFilename . '>',);

        $ffmpeg = \Streaming\FFMpeg::create($config, $this->logger);
        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);
        $frame = $ffmpegVideo->frame(TimeCode::fromSeconds($videoDuration * 0.25));
        $frame->save($localOutputDirectory. '/thumbnail.jpg');

        $this->logger->info('Finished creation of preview image for <' . $inputVideoFilename . '>',);
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
