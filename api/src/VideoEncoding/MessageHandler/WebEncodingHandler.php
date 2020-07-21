<?php


namespace App\VideoEncoding\MessageHandler;


use App\Core\FileSystemService;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use App\VideoEncoding\Message\WebEncodingTask;
use Doctrine\ORM\EntityManagerInterface;
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

        $ffmpeg = \Streaming\FFMpeg::create($config, $this->logger);

        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);

        /*$ffmpegVideo->dash()
            ->x264() // Format of the video. Alternatives: hevc() and vp9()
            ->autoGenerateRepresentations() // Auto generate representations
            ->save($localOutputDirectory . '/dash.mpd'); // It can be passed a path to the method or it can be null
        */

        $ffmpegVideo->hls()
            ->fragmentedMP4()
            ->x264()
            ->autoGenerateRepresentations([720, 360]) // You can limit the number of representatons
            ->save($localOutputDirectory . '/hls.m3u8');


        $this->fileSystemService->moveDirectory($outputDirectory, $encodingTask->getDesiredOutputDirectory());

        $video->setEncodedVideoDirectory($encodingTask->getDesiredOutputDirectory());
        $video->setEncodingFinished(true);

        $this->eventStore->addEvent('VideoEncodedCompletely', [
            'videoId' => $video->getId(),
            'encodedVideoDirectory' => $encodingTask->getDesiredOutputDirectory()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }
}
