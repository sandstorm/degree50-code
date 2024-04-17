<?php

namespace App\VideoEncoding\Service;

use App\Core\FileSystemService;
use App\Domain\Exercise\Dto\ServerSideSolutionData\ServerSideCut;
use App\Domain\Video\Video;
use App\VideoEncoding\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use League\Flysystem\FileExistsException;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;

class EncodingService
{
    const CONFIG = [
        'ffmpeg.binaries' => '/usr/bin/ffmpeg',
        'ffprobe.binaries' => '/usr/bin/ffprobe',
        'timeout' => 3600, // The timeout for the underlying process
        'ffmpeg.threads' => 12,   // The number of threads that FFmpeg should use
    ];

    private FFMpeg $ffmpeg;
    private FFProbe $ffprobe;

    public function __construct(
        private readonly LoggerInterface       $logger,
        private readonly ParameterBagInterface $parameterBag,
        private readonly FileSystemService     $fileSystemService
    )
    {
        $this->ffmpeg = FFMpeg::create(self::CONFIG, $this->logger);
        $this->ffprobe = FFProbe::create(self::CONFIG, $logger);
    }

    /**
     * @param $cutList ServerSideCut[]
     * @return string[]
     */
    public function createTemporaryMp4ClipsFromCutList(array $cutList): array
    {
        $rootDir = $this->parameterBag->get('kernel.project_dir');
        $localOutputDirectory = $this->fileSystemService->localPath($this->fileSystemService->generateUniqueTemporaryDirectory());
        $inputVideoFileName = $rootDir . '/public' . $cutList[0]->url;

        $hasAudioDescriptions = $this->hasAudioDescriptions($inputVideoFileName);

        return array_map(function (ServerSideCut $cut) use ($localOutputDirectory, $rootDir, $inputVideoFileName, $hasAudioDescriptions) {
            $clipUuid = Uuid::uuid4()->toString();
            $this->logger->info('Creating new intermediate clip with ID ' . $clipUuid);

            $clipPath = $localOutputDirectory . '/' . $clipUuid . '_x264.mp4';

            // ffmpeg can work with milliseconds and seeks to the nearest available frame
            $offset = round($cut->offset, 3);
            $videoDurationInSeconds = $cut->getDuration();

            $duration = $videoDurationInSeconds > 0 ? $videoDurationInSeconds : 1;

            $this->logger->info('url: ' . $inputVideoFileName);
            $this->logger->info('offset: ' . TimeCode::fromSeconds($offset)->toTimeString());
            $this->logger->info('duration: ' . TimeCode::fromSeconds($duration)->toTimeString());
            $this->logger->info('clipPath: ' . $clipPath);

            /**
             * Build ffmpeg command.
             * Why:
             * We use a custom ffmpeg command because we are unable to model our needs
             * and expected output with the \FFMpeg\FFMpeg package.
             * We build the command as an array and use the Driver\FFMpegDriver to execute it.
             */

            $inputWithCutAndMapping = [
                '-y', # overwrite previous outputs
                '-ss', "$offset", # seek to start offset (seconds) (see https://trac.ffmpeg.org/wiki/Seeking)
                '-i', "$inputVideoFileName", # input video
                '-t', "$duration", # duration of cut in seconds
                '-map', '0:v', # map video to video stream #0
                '-map', '0:a:0', # map first audio to audio stream #0
            ];

            if ($hasAudioDescriptions) {
                # map second audio to audio stream #1
                $inputWithCutAndMapping[] = '-map';
                $inputWithCutAndMapping[] = '0:a:1';
            }

            // WHY: We re-encode the streams to prevent missing i-frames
            $codecs = [
                '-c:v', 'libx264', # convert video stream to h264
                # WHY: We use aac over libmp3lame as the latter produced unplayable audio streams for videoJS (m4a).
                # Error msg: "VIDEOJS: ERROR: DOMException: Failed to execute 'addSourceBuffer' on 'MediaSource': The type provided ('audio/mp4;codecs="mp4a.40.34"') is unsupported."
                '-c:a', 'aac', # convert all audio streams to AAC
            ];

            $outputTarget = [
                "$clipPath"
            ];

            $finalCommand = array_merge($inputWithCutAndMapping, $codecs, $outputTarget);

            $this->ffmpeg->getFFMpegDriver()->command($finalCommand);

            $this->logger->info("Finished encoding MP4 clip <$clipUuid> to $localOutputDirectory");

            return $clipPath;

        }, $cutList);
    }

    /**
     * @throws FileExistsException
     */
    public function encodeMP4WithAudioDescription(Video $video, string $localOutputDirectory): void
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

        $this->ffmpeg->getFFMpegDriver()->command($finalCommand);

        $this->logger->info("Finished encoding MP4 of file <$inputVideoFileName> to $localOutputDirectory/x264.mp4");
    }

    /**
     * Concatenate mp4 video clips to a new mp4 file
     * using the "playlist file method" described here (https://trac.ffmpeg.org/wiki/Concatenate).
     *
     * @param array $clipPaths clip file paths
     * @param string $localOutputDirectory
     * @return string The result video file path
     */
    public function concatMp4Clips(array $clipPaths, string $localOutputDirectory): string
    {
        if (!file_exists($localOutputDirectory)) {
            mkdir($localOutputDirectory, 0777, true);
        }

        $mp4Url = "$localOutputDirectory/x264.mp4";

        $tmpPlaylistPath = "$localOutputDirectory/_clips.txt";
        $tmpPlaylistContent = array_reduce($clipPaths, function ($playlist, $clipPath) {
            return $playlist . "file '$clipPath'\n";
        });

        $fileSystem = new Filesystem();
        //$fileSystem->touch([$tmpPlaylistPath]);
        file_put_contents($tmpPlaylistPath, $tmpPlaylistContent);

        $hasAudioDescriptions = $this->hasAudioDescriptions($clipPaths[0]);


        $concat = [
            '-y',
            '-f', 'concat', # use concat via file
            '-safe', '0', # TODO: is this necessary?
            '-i', "$tmpPlaylistPath", # input playlist as text file
            '-map', 'v:0', # map video
            '-map', 'a:0', # map original audio
        ];

        // map audio descriptions if available
        if ($hasAudioDescriptions) {
            $concat[] = '-map';
            $concat[] = 'a:1';
        }

        // re-encode
        $codecs = [
            '-c:v', 'libx264',
            '-c:a', 'aac'
        ];

        $outputTarget = [
            $mp4Url
        ];

        $finalCommand = array_merge($concat, $codecs, $outputTarget);

        $this->ffmpeg->getFFMpegDriver()->command($finalCommand);

        $this->logger->info("Finished concatenating MP4 clips to '$mp4Url'");

        // remove temporary playlist file
        if ($fileSystem->exists($tmpPlaylistPath)) {
            $fileSystem->remove($tmpPlaylistPath);
        }

        return $mp4Url;
    }

    public function encodeHLS(string $inputVideoFileName, string $localOutputDirectory): void
    {
        $this->logger->info('Start encoding HLS of file <' . $inputVideoFileName . '>');

        /**
         * We count the input video (generated mp4 @see $encodeMP4WithAudioDescription) to determine
         * whether we have just a single audio stream or both original audio and audio description streams.
         */
        $hasAudioDescriptions = $this->hasAudioDescriptions($inputVideoFileName);

        $this->logger->info("Found audio description stream in '$inputVideoFileName': ", [$hasAudioDescriptions ? 'YES' : 'NO']);

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
        if ($hasAudioDescriptions) {
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

        $this->ffmpeg->getFFMpegDriver()->command($finalCommand);

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

    public function createPreviewImage(string $inputVideoFilename, string $localOutputDirectory, float $videoDuration): void
    {
        $this->logger->info('Create preview image for <' . $inputVideoFilename . '>');

        $ffmpegVideo = $this->ffmpeg->open($inputVideoFilename);
        $frame = $ffmpegVideo->frame(\FFMpeg\Coordinate\TimeCode::fromSeconds($videoDuration * 0.25));
        $frame->save($localOutputDirectory . '/thumbnail.jpg');

        $this->logger->info('Finished creation of preview image for <' . $inputVideoFilename . '>');
    }

    public function probeForVideoDuration(string $filePath)
    {
        return $this->ffprobe
            ->format($filePath) // extracts file information
            ->get('duration');
    }

    private function probeForFrameRate(string $filePath)
    {
        return $this->ffprobe
            ->streams($filePath)
            ->videos()
            ->first()
            ->get('r_frame_rate');
    }

    private function hasAudioDescriptions(string $filePath): bool
    {
        // if there are 2 audio streams, we have audio descriptions
        $audioStreamCount = $this->ffprobe
            ->streams($filePath)
            ->audios()
            ->count();

        return $audioStreamCount > 1;
    }
}
