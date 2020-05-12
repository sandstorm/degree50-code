<?php


namespace App\VideoEncoding\MessageHandler;


use App\Utility\FileSystemService;
use App\VideoEncoding\Message\WebEncodingTask;
use League\Flysystem\Filesystem;
use League\Flysystem\MountManager;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class WebEncodingHandler implements MessageHandlerInterface
{
    private LoggerInterface $logger;
    private FileSystemService $fileSystemService;

    public function __construct(LoggerInterface $logger, FileSystemService $fileSystemService)
    {
        $this->logger = $logger;
        $this->fileSystemService = $fileSystemService;
    }


    public function __invoke(WebEncodingTask $encodingTask)
    {
        $inputVideoFilename = $this->fileSystemService->fetchIfNeededAndGetLocalPath($encodingTask->getInputVideoFilename());

        $config = [
            'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
            'ffprobe.binaries' => '/usr/bin/ffprobe',
            'timeout'          => 3600, // The timeout for the underlying process
            'ffmpeg.threads'   => 12,   // The number of threads that FFmpeg should use
        ];

        $outputDirectory = $this->fileSystemService->generateUniqueTemporaryDirectory();
        $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

        $ffmpeg = \Streaming\FFMpeg::create($config, $this->logger);

        $video = $ffmpeg->open($inputVideoFilename);

        $video->dash()
            ->x264() // Format of the video. Alternatives: hevc() and vp9()
            ->autoGenerateRepresentations() // Auto generate representations
            ->save($localOutputDirectory . '/dash.mpd'); // It can be passed a path to the method or it can be null

        $video->hls()
            ->x264()
            ->autoGenerateRepresentations([720, 360]) // You can limit the number of representatons
            ->save($localOutputDirectory . '/hls.m3u8');

        $this->fileSystemService->moveDirectory($outputDirectory, $encodingTask->getOutputDirectory());
    }
}
