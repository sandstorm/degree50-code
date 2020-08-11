<?php


namespace App\VideoEncoding\MessageHandler;


use App\Core\FileSystemService;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use App\VideoEncoding\Message\WebEncodingTask;
use Doctrine\ORM\EntityManagerInterface;
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class WebEncodingHandler implements MessageHandlerInterface
{
    private LoggerInterface $logger;
    private FileSystemService $fileSystemService;
    private VideoRepository $videoRepository;
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(LoggerInterface $logger, FileSystemService $fileSystemService, VideoRepository $videoRepository, EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore)
    {
        $this->logger = $logger;
        $this->fileSystemService = $fileSystemService;
        $this->videoRepository = $videoRepository;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
    }


    public function __invoke(WebEncodingTask $encodingTask)
    {
        try {
            $this->entityManager->getFilters()->disable('video_doctrine_filter');
            $video = $this->videoRepository->find($encodingTask->getVideoId());
            if ($video === null) {
                $this->logger->warning('Video not found for encoding', ['videoId' => $encodingTask->getVideoId()]);
                return;
            }

            $inputVideoFilename = $this->fileSystemService->fetchIfNeededAndGetLocalPath($video->getUploadedVideoFile());

            $config = [
                'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
                'timeout'          => 3600, // The timeout for the underlying process
                'ffmpeg.threads'   => 12,   // The number of threads that FFmpeg should use
            ];

            $outputDirectory = $this->fileSystemService->generateUniqueTemporaryDirectory();
            $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

            $this->encodeMP4($config, $inputVideoFilename, $localOutputDirectory);
            $this->encodeHLS($config, $inputVideoFilename, $localOutputDirectory);

            $video->setEncodingFinished(true);

            $this->eventStore->addEvent('VideoEncodedCompletely', [
                'videoId' => $video->getId(),
                'encodedVideoDirectory' => $encodingTask->getDesiredOutputDirectory()->getVirtualPathAndFilename(),
            ]);

            $this->fileSystemService->moveDirectory($outputDirectory, $encodingTask->getDesiredOutputDirectory());

            $video->setEncodedVideoDirectory($encodingTask->getDesiredOutputDirectory());

            $this->pingAndReconnectDB();

            $this->entityManager->persist($video);
            $this->entityManager->flush();
        } finally {
            // Disabling the filter happens globally and not on a per request basis.
            // Therefore we have to re-enable the filter after we are done encoding.
            $this->entityManager->getFilters()->enable('video_doctrine_filter');
        }
    }

    private function encodeMP4(Array $config, string $inputVideoFilename, string $localOutputDirectory) {
        $this->logger->info('Start encoding MP4 of file <' . $inputVideoFilename . '>',);

        $ffmpeg = FFMpeg::create($config, $this->logger);
        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);
        $ffmpegVideo->save(new X264('libmp3lame'), $localOutputDirectory . '/x264.mp4');

        $this->logger->info('Finish encoding MP4 of file <' . $inputVideoFilename . '>',);
    }

    private function encodeHLS(Array $config, string $inputVideoFilename, string $localOutputDirectory) {
        $this->logger->info('Start encoding HLS of file <' . $inputVideoFilename . '>',);

        $ffmpeg = \Streaming\FFMpeg::create($config, $this->logger);

        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);

        $ffmpegVideo->hls()
            ->fragmentedMP4()
            ->x264()
            ->autoGenerateRepresentations([720, 360]) // You can limit the number of representatons
            ->save($localOutputDirectory . '/hls.m3u8');

        $this->logger->info('Finish encoding HLS of file <' . $inputVideoFilename . '>',);

    }

    private function pingAndReconnectDB() {
        // WHY: The encoding process might take quite long and the db connection might have been
        // lost/closed in the meantime. Therefore we check if we still have a connection and
        // otherwise reconnect.
        if ($this->entityManager->getConnection()->ping() === false) {
            $this->entityManager->getConnection()->close();
            $this->entityManager->getConnection()->connect();
        }
    }
}
