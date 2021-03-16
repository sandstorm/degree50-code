<?php


namespace App\VideoEncoding\MessageHandler;


use App\Core\FileSystemService;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideCut;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Video\VideoRepository;
use App\VideoEncoding\Message\CutListEncodingTask;
use Doctrine\ORM\EntityManagerInterface;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use FFMpeg\Format\Video\X264;
use FFMpeg\Media\Video as MediaVideo;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

/**
 * Handler which is responsible for the encoding of videos from a given cutList
 * Invokes an FFMPEG worker to do the actual encoding
 *  NOTE: empty space between cutList items which might exist inside the
 *  frontend view, is not taken into consideration when creating the video
 *  on the serverside.
 */
class CutListEncodingHandler implements MessageHandlerInterface
{
    private LoggerInterface $logger;
    private FileSystemService $fileSystemService;
    private VideoRepository $videoRepository;
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;
    private ParameterBagInterface $parameterBag;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;

    public function __construct(LoggerInterface $logger, ParameterBagInterface $parameterBag, FileSystemService $fileSystemService, VideoRepository $videoRepository, EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore, ExercisePhaseTeamRepository $exercisePhaseTeamRepository)
    {
        $this->logger = $logger;
        $this->parameterBag = $parameterBag;
        $this->fileSystemService = $fileSystemService;
        $this->videoRepository = $videoRepository;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
    }


    public function __invoke(CutListEncodingTask $encodingTask)
    {
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->find($encodingTask->getExercisePhaseTeamId());
        $exercisePhase = $exercisePhaseTeam->getExercisePhase();

        if (!$exercisePhase instanceof VideoCutPhase) {
            return;
        }

        $cutList = $exercisePhaseTeam->getSolution()->getSolution()->getCutList();

        if (empty($cutList)) {
            return;
        }

        $this->entityManager->getFilters()->disable('video_doctrine_filter');

        try {
            $video = $this->videoRepository->find($encodingTask->getVideoId());

            $config = [
                'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe',
                'timeout'          => 3600, // The timeout for the underlying process
                'ffmpeg.threads'   => 12,   // The number of threads that FFmpeg should use
            ];

            $ffmpeg = FFMpeg::create($config, $this->logger);

            $this->logger->info('Creating intermediate clips from cutList...');
            $clipPaths = $this->createTemporaryClips($ffmpeg, $cutList);

            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());

            $this->logger->info('Concatenating clips into video...');
            $mp4Url = $this->concatAndEncodeClips($clipPaths, $outputDirectory, $ffmpeg);

            $video->setVideoDuration($this->probeForVideoDuration($mp4Url));
            $video->setEncodingStatus(Video::ENCODING_FINISHED);

            $this->eventStore->addEvent('VideoEncodedCompletely', [
                'videoId' => $video->getId(),
                'encodedVideoDirectory' => $outputDirectory->getVirtualPathAndFilename(),
            ]);

            $video->setEncodedVideoDirectory($outputDirectory);

            $this->logger->info('Done combining clips into video <' . $mp4Url . '>');

            $video->setTitle('Cut_video, ' . $video->getCreator()->getUsername() . ', ' . $exercisePhaseTeam->getExercisePhase()->getName());

            $this->pingAndReconnectDB();

            // Add Video to Solution
            $solution = $exercisePhaseTeam->getSolution();
            $solution->setCutVideo($video);

            $this->entityManager->persist($video);
            $this->entityManager->persist($solution);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->error($exception->getMessage());
            $video->setEncodingStatus(Video::ENCODING_ERROR);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->persist($video);
            $this->entityManager->flush();
        } finally {
            // Disabling the filter happens globally and not on a per request basis.
            // Therefore we have to re-enable the filter after we are done encoding.
            $this->entityManager->getFilters()->enable('video_doctrine_filter');
        }
    }

    private function probeForVideoDuration(string $filePath)
    {
        $ffprobe = FFProbe::create();
        $duration = $ffprobe
            ->format($filePath) // extracts file informations
            ->get('duration');

        return $duration;
    }

    private function probeForFrameRate(string $filePath)
    {
        $ffprobe = FFProbe::create();
        $frameRate = $ffprobe
            ->streams($filePath)
            ->videos()
            ->first()
            ->get('r_frame_rate');

        return $frameRate;
    }

    /*
     * Given a list of clip file paths, this function concatenates the clips into a single video and returns the path
     * of the resulting file.
     *
     * @returns string - URL of the created video
     */
    private function concatAndEncodeClips(array $clipPaths, VirtualizedFile $outputDirectory, FFMpeg $ffmpeg): string
    {
        $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

        $firstClipPath = $clipPaths[0];
        $remainingClipPaths = array_slice($clipPaths, 1);

        $mp4Url = $localOutputDirectory . '/x264.mp4';

        $firstClip = $ffmpeg->open($firstClipPath);

        if (!file_exists($localOutputDirectory)) {
            mkdir($localOutputDirectory, 0777, true);
        }

        $fileSystem = new Filesystem();
        if ($fileSystem->exists($mp4Url)) {
            $fileSystem->remove($mp4Url);
        }

        if (empty($remainingClipPaths)) {
            // TODO we could probably simply copy the temporary
            // clip instead of encoding it twice...
            $firstClip->save(new X264('libmp3lame'), $mp4Url);
        } else {
            // TODO: Somehow concatenating ignores the Video itself
            // The result is missing the $firstClip.
            // Fix for now is to use all clipPaths again.
            $ffmpegVideo = $firstClip->concat($clipPaths);
            $ffmpegVideo->saveFromSameCodecs($mp4Url);
        }

        return $mp4Url;
    }

    /*
     * Encodes intermediate video clips from a given cutList which are later used to
     * eventually concatenate them into a single video
     */
    private function createTemporaryClips(FFMpeg $ffmpeg, $cutList)
    {
        $clipOutputDirectory = $this->fileSystemService->generateUniqueTemporaryDirectory();
        $rootDir = $this->parameterBag->get('kernel.project_dir');

        $clipPaths = array_map(function (ServerSideCut $cut) use ($ffmpeg, $clipOutputDirectory, $rootDir) {
            $this->logger->info('Creating new intermediate clip...');

            $inputVideoFilename = $rootDir . '/public' . $cut->getUrl();
            $localOutputDirectory = $this->fileSystemService->localPath($clipOutputDirectory);
            $clipUuid = Uuid::uuid4()->toString();
            $outputPath = $localOutputDirectory . '/' . $clipUuid . '_x264.mp4';

            $ffmpegVideo = $ffmpeg->open($inputVideoFilename);
            $frameRate = $this->probeForFrameRate($inputVideoFilename);

            $this->logger->info('FRAMERATE: ' . $frameRate);

            if ($ffmpegVideo instanceof MediaVideo) {
                $offset = round($cut->getOffset(), 0, PHP_ROUND_HALF_UP);
                $videoStartOffset = TimeCode::fromSeconds($offset);
                $videoTimelineStart = TimeCode::fromString($cut->getStart());
                $videoTimelineEnd = TimeCode::fromString($cut->getEnd());

                $fps = (int)explode('/', $frameRate)[0];
                $videoStartSeconds = $this->getSecondsFromTimeCode($videoTimelineStart, $fps);
                $videoEndSeconds = $this->getSecondsFromTimeCode($videoTimelineEnd, $fps);
                $videoDurationInSeconds = $videoEndSeconds - $videoStartSeconds;

                $duration = $videoDurationInSeconds > 0 ? $videoDurationInSeconds : 1;
                $videoDurationTimeCode = TimeCode::fromSeconds($duration);

                $this->logger->info('url: ' . $inputVideoFilename);
                $this->logger->info('offset: ' . $videoStartOffset);
                $this->logger->info('duration: ' . $videoDurationTimeCode);
                $this->logger->info('outputPath: ' . $outputPath);

                // NOTE:
                // The clips offset and duration might slightly deviate from the actual
                // clips of the original cutList. This is due to some rounding we have to do
                // to remain compatible with the @FFMpeg/Coordinate/TimeCode-class, which
                // expects integers or otherwise does also round (but worse than our rounding, in most situations).
                // TODO Add this constraint to the UX so that the user knows.
                $ffmpegVideo
                    ->clip($videoStartOffset, $videoDurationTimeCode)
                    ->save(new X264('libmp3lame'), $outputPath);

                return $outputPath;
            } else {
                return null;
            }
        }, $cutList);

        return $clipPaths;
    }

    /*
     * The toSeconds() method of @FFMpeg/Coordinate/TimeCode does not take frames into account.
     * Therefore we do our own conversion with the detected frames per second.
     */
    private function getSecondsFromTimeCode(TimeCode $timeCode, int $fps)
    {
        $secondsWithoutFrames = $timeCode->toSeconds();

        // Small hack to access private properties of the TimeCode class
        $frameGetter = \Closure::bind(function (TimeCode $class) {
            return $class->frames;
        }, null, TimeCode::class);

        $frames = $frameGetter($timeCode, $fps);
        $secondsWithFrames = $secondsWithoutFrames + ($frames / ($fps * 10));

        return (int)$secondsWithFrames;
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
