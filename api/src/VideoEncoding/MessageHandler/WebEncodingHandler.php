<?php


namespace App\VideoEncoding\MessageHandler;


use App\VideoEncoding\Message\WebEncodingTask;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class WebEncodingHandler implements MessageHandlerInterface
{
    private LoggerInterface $logger;

    /**
     * WebEncodingHandler constructor.
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }


    public function __invoke(WebEncodingTask $encodingTask)
    {

        $config = [
            'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
            'ffprobe.binaries' => '/usr/bin/ffprobe',
            'timeout'          => 3600, // The timeout for the underlying process
            'ffmpeg.threads'   => 12,   // The number of threads that FFmpeg should use
        ];


        $ffmpeg = \Streaming\FFMpeg::create($config, $this->logger);

        $video = $ffmpeg->open($encodingTask->getInputVideoFilename());

        $video->dash()
            ->x264() // Format of the video. Alternatives: hevc() and vp9()
            ->autoGenerateRepresentations() // Auto generate representations
            ->save(); // It can be passed a path to the method or it can be null

        $video->hls()
            ->x264()
            ->autoGenerateRepresentations([720, 360]) // You can limit the number of representatons
            ->save();
    }
}
