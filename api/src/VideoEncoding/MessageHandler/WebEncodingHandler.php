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
use Exception;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
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

            $config = [
                'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
                'timeout' => 3600, // The timeout for the underlying process
                'ffmpeg.threads' => 12,   // The number of threads that FFmpeg should use
            ];

            $outputDirectory = $this->fileSystemService->generateUniqueTemporaryDirectory();
            $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

            $this->encodeMP4WithAudioDescription($config, $video, $localOutputDirectory);

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

    private function probeForVideoDuration(string $filePath): float
    {
        $ffprobe = FFProbe::create();
        $duration = $ffprobe
            ->format($filePath) // extracts file information
            ->get('duration');

        return $duration;
    }

    /**
     * @throws FileExistsException
     */
    private function encodeMP4WithAudioDescription(array $config, Video $video, string $localOutputDirectory)
    {
        $inputVideoFileName = $this->fileSystemService->fetchIfNeededAndGetLocalPath($video->getUploadedVideoFile());
        $inputAudioDescriptionFileName = empty($video->getUploadedAudioDescriptionFile()->getVirtualPathAndFilename())
            ? null
            : $this->fileSystemService->fetchIfNeededAndGetLocalPath($video->getUploadedAudioDescriptionFile());

        $this->logger->info('Start encoding MP4 of file <' . $inputVideoFileName . '>.');

        /**
         * We encode the audio description file into the video when we initially encode it to MP4
         */

        /**
         * Build ffmpeg command.
         * Why:
         * We use a custom ffmpeg command because we are unable to model our needs
         * and expected output with the \FFMpeg\FFMpeg package.
         * We build the command as an array and use the Driver\FFMpegDriver to execute it.
         */

        $inputs = [
            '-y', # overwrite previous outputs
            '-i', "$inputVideoFileName", # video input (contains the prepared video with two audio streams)
        ];

        $inputMapping = [
            '-map', '0:v', # map video to video stream #0
            '-map', '0:a:0', # map first audio to audio stream #0
        ];

        # add audio description stream if available
        if ($inputAudioDescriptionFileName) {
            $this->logger->info('Adding AudioDescriptions of file <' . $inputAudioDescriptionFileName . '> to MP4');

            # add audio description stream as input
            $inputs[] = '-i';
            $inputs[] = "$inputAudioDescriptionFileName";
            # map audio stream of second input to audio #1
            $inputMapping[] = '-map';
            $inputMapping[] = '1:a';
        }

        $conversion = [
            '-c:v', 'libx264', # convert video stream to h264
            # WHY: We use aac over libmp3lame as the latter produced unplayable audio streams for videoJS (m4a).
            # Error msg: "VIDEOJS: ERROR: DOMException: Failed to execute 'addSourceBuffer' on 'MediaSource': The type provided ('audio/mp4;codecs="mp4a.40.34"') is unsupported."
            '-c:a', 'aac', # convert all audio streams to AAC
            '-shortest', # the new duration will be determined by the shortest input
        ];

        $outputTarget = [
            "$localOutputDirectory/x264.mp4"
        ];

        $finalCommand = array_merge($inputs, $inputMapping, $conversion, $outputTarget);

        $ffmpeg = FFMpeg::create($config, $this->logger);
        $ffmpeg->getFFMpegDriver()->command($finalCommand, false);

        $this->logger->info("Finished encoding MP4 of file <$inputVideoFileName> to $localOutputDirectory/x264.mp4");
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

    private function encodeHLS(array $config, string $inputVideoFileName, string $localOutputDirectory)
    {
        $this->logger->info('Start encoding HLS of file <' . $inputVideoFileName . '>');

        /**
         * We count the input video (generated mp4 @see $encodeMP4WithAudioDescription) to determine
         * whether we have just a single audio stream or both original audio and audio description streams.
         */
        $ffmpeg = FFMpeg::create($config, $this->logger);
        $countOfAudioStreams = $ffmpeg->getFFProbe()->streams($inputVideoFileName)->audios()->count();

        $this->logger->info('Found ' . $countOfAudioStreams . ' audio streams.');

        /**
         * Build ffmpeg command.
         * Why:
         * We use a custom ffmpeg command because we are unable to model our needs
         * and expected output with the \Streaming\FFMpeg package.
         * We build the command as an array and use the Driver\FFMpegDriver to execute it.
         */

        $inputMapping = [
            '-y', # overwrite previous outputs
            '-i', "$inputVideoFileName", # video input (contains the prepared video with two audio streams)
            '-map', '0:v', # map video to video stream #0
            '-map', '0:v', # map video to video stream #1
            '-map', '0:v', # map video to video stream #2
            '-map', '0:a:0', # map first audio to audio stream #0
        ];

        # WHY: conditional parameters depending on presence of additional audio (description) stream
        if ($countOfAudioStreams > 1) {
            # map second audio to audio stream #1 IF it is available\
            $inputMapping[] = '-map';
            $inputMapping[] = '0:a:1';
            # This map describes the structure of the streams.
            # We have 3 different video stream that use the audio of audio_group "audio" and two audio streams in that audio group.
            # Note: unfortunately we can not set metadata like TITLE here. The name:XXX prop is only used for file naming.\
            $inputMapping[] = '-var_stream_map';
            $inputMapping[] = 'v:0,name:360p,agroup:audio v:1,agroup:audio,name:720p v:2,agroup:audio,name:1080p a:0,agroup:audio,name:Original,language:DE,default:YES a:1,agroup:audio,name:Descriptions,language:DE,default:NO';
        } else {
            # This map describes the structure of the streams.
            # We have 3 different video stream that use the audio of audio_group "audio" and one audio stream in that audio group.
            # Note: unfortunately we can not set metadata like TITLE here. The name:XXX prop is only used for file naming.\
            $inputMapping[] = '-var_stream_map';
            $inputMapping[] = 'v:0,agroup:audio,name:360p v:1,agroup:audio,name:720p v:2,agroup:audio,name:1080p a:0,agroup:audio,name:Original,language:DE,default:YES';
        }

        # convert streams to wanted format.
        $encoding = [
            # encode videos to h264 (again) (this has to be done for the "-filter:v:x" option to work)
            '-c:v:0', 'libx264',
            '-c:v:1', 'libx264',
            '-c:v:2', 'libx264',
            '-c:a', 'copy', # copy codec of any audio stream (we assume all audio streams already are encoded correctly because we create the baseline mp4 @see encodeMP4WithAudioDescription
        ];

        $preConversionHlsOptions = [
            '-bf', '1',
            '-g', '48',
            '-keyint_min', '48',
            '-sc_threshold', '0',
            '-hls_list_size', '0',
            '-hls_time', '10',
            '-hls_allow_cache', '1',
        ];

        # low res video stream rendition
        $lowResStream = [
            '-b:v:0', '533k',
            '-filter:v:0', "scale=w='min(640,iw)':h='min(360,ih)':force_original_aspect_ratio=decrease",
        ];

        # medium res video stream rendition
        $mediumResStream = [
            '-b:v:1', '710k',
            '-filter:v:1', "scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease",
        ];

        # high res video stream rendition
        $highResStream = [
            '-b:v:2', '1066k',
            '-filter:v:2', "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease",
        ];

        $generalHlsOptions = [
            '-strict', '-2',
            '-master_pl_name', 'hls.m3u8', # set the name of the master playlist
            '-hls_playlist_type', 'vod', # set playlist type to video on demand
            '-hls_segment_filename', "$localOutputDirectory/hls_%v_%04d.ts",
            "$localOutputDirectory/hls_%v.m3u8",
        ];

        $finalCommand = array_merge($inputMapping, $encoding, $preConversionHlsOptions, $lowResStream, $mediumResStream, $highResStream, $generalHlsOptions);

        $ffmpeg->getFFMpegDriver()->command($finalCommand, false);

        /**
         * WHY: In order to enable the videoJS player to show the correct names of the audio streams
         *      we have to change them in the master playlist file (hls.m3u8) as we are currently
         *      unable to set them correctly with ffmpeg.
         *
         *      We read the generated master playlist file into memory and search/replace the names
         *      from "audio_3" and "audio_4" to "Original" and "Deskription" respectively.
         *
         *      As of now we are unsure if the auto generated names by ffmpeg are consistent so we
         *      use a regex to accommodate for potential changes of the digit (e.g. "audio_1" or "audio23").
         *
         *      We also add the "CHARACTERISTICS" metadata "public.accessibility.describes-video" to the
         *      audio descriptions stream to indicate it's purpose to the videoJS player and thus to the user.
         */
        $masterPlaylist = file_get_contents("$localOutputDirectory/hls.m3u8");

        $masterPlaylist = preg_replace('/NAME="audio_\d+"/', 'NAME="Original"', $masterPlaylist, 1);
        $masterPlaylist = preg_replace('/NAME="audio_\d+"/', 'NAME="Deskription"', $masterPlaylist, 1);
        $masterPlaylist = preg_replace('/hls_Descriptions.m3u8"/', 'hls_Descriptions.m3u8",CHARACTERISTICS="public.accessibility.describes-video"', $masterPlaylist, 1);

        file_put_contents("$localOutputDirectory/hls.m3u8", $masterPlaylist);

        $this->logger->info('Finished encoding HLS of file <' . $inputVideoFileName . '>');
    }

    private function createPreviewImage(array $config, string $inputVideoFilename, string $localOutputDirectory, float $videoDuration)
    {
        $this->logger->info('Create preview image for <' . $inputVideoFilename . '>');

        $ffmpeg = FFMpeg::create($config, $this->logger);
        $ffmpegVideo = $ffmpeg->open($inputVideoFilename);
        $frame = $ffmpegVideo->frame(TimeCode::fromSeconds($videoDuration * 0.25));
        $frame->save($localOutputDirectory . '/thumbnail.jpg');

        $this->logger->info('Finished creation of preview image for <' . $inputVideoFilename . '>');
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
