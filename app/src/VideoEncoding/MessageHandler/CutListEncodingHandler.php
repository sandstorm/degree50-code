<?php

namespace App\VideoEncoding\MessageHandler;

use App\Domain\ExercisePhase\Model\VideoCutPhase;
use App\FileSystem\FileSystemService;
use App\Domain\Video\Model\Video;
use App\Domain\VirtualizedFile\Model\VirtualizedFile;
use App\Domain\ExercisePhaseTeam\Repository\ExercisePhaseTeamRepository;
use App\Domain\Video\Repository\VideoRepository;
use App\VideoEncoding\Message\CutListEncodingTask;
use App\VideoEncoding\Service\EncodingService;
use App\VideoEncoding\Service\SubtitleService;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

/**
 * Handler which is responsible for the encoding of videos from a given cutList
 * Invokes an FFMPEG worker to do the actual encoding
 * NOTE: empty space between cutList items which might exist inside the
 * frontend view, is not taken into consideration when creating the video
 * on the serverside.
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
class CutListEncodingHandler implements MessageHandlerInterface
{
    public function __construct(
        private readonly LoggerInterface              $logger,
        private readonly FileSystemService            $fileSystemService,
        private readonly VideoRepository              $videoRepository,
        private readonly EntityManagerInterface       $entityManager,
        private readonly ExercisePhaseTeamRepository  $exercisePhaseTeamRepository,
        private readonly EncodingService              $encodingService,
        private readonly SubtitleService              $subtitleService,
        private readonly ParameterBagInterface        $parameterBag
    )
    {
    }

    public function __invoke(CutListEncodingTask $encodingTask): void
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

        $cutVideo = $this->videoRepository->find($encodingTask->getVideoId());

        try {
            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $cutVideo->getId());
            $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);
            $rootDir = $this->parameterBag->get('kernel.project_dir');

            $this->logger->info('Creating intermediate clips from cutList...');
            $clipPaths = $this->encodingService->createTemporaryMp4ClipsFromCutList($cutList);

            $this->logger->info('Concatenating clips into video...');
            $mp4Url = $this->encodingService->concatMp4Clips($clipPaths, $localOutputDirectory);

            // TODO: remove temporary clips?

            $cutVideo->setVideoDuration($this->encodingService->probeForVideoDuration($mp4Url));

            $this->encodingService->encodeHLS($mp4Url, $localOutputDirectory);

            $cutVideo->setEncodedVideoDirectory($outputDirectory);

            $this->logger->info("Done combining clips into video <$mp4Url>");

            $cutVideo->setTitle('Cut_video, ' . $cutVideo->getCreator()->getUsername() . ', ' . $exercisePhaseTeam->getExercisePhase()->getName());

            $originalVideoPath = $rootDir . '/public' . $cutList[0]->url;
            // get path without file name of mp4 and append "subtitles.vtt"
            $originalSubtitlePath = str_replace("x264.mp4", "subtitles.vtt", $originalVideoPath);

            // cut subtitles
            if (file_exists($originalSubtitlePath)) {
                $this->logger->info("Cutting subtitles");
                $originalSubtitles = file_get_contents($originalSubtitlePath);

                $newSubtitles = $this->subtitleService->cutSubtitlesForCutList($originalSubtitles, $cutList);
                $newSubtitlesPath = $localOutputDirectory . "/subtitles.vtt";

                file_put_contents($newSubtitlesPath, $newSubtitles);

                $cutVideo->setUploadedSubtitleFile(VirtualizedFile::fromString($newSubtitlesPath));

                $this->logger->info("Done cutting subtitles");
            }

            $this->pingAndReconnectDB();

            // Add Video to Solution
            $solution = $exercisePhaseTeam->getSolution();
            $solution->setCutVideo($cutVideo);

            $cutVideo->setEncodingStatus(Video::ENCODING_FINISHED);

            $this->eventStore->addEvent('VideoEncodedCompletely', [
                'videoId' => $cutVideo->getId(),
                'encodedVideoDirectory' => $outputDirectory->getVirtualPathAndFilename(),
            ]);

            $this->entityManager->persist($cutVideo);
            $this->entityManager->persist($solution);
            $this->entityManager->flush();
        } catch (Exception $exception) {
            $this->logger->error($exception->getMessage());
            $cutVideo->setEncodingStatus(Video::ENCODING_ERROR);
            $this->entityManager->persist($cutVideo);
            $this->entityManager->flush();
        } finally {
            // Disabling the filter happens globally and not on a per request basis.
            // Therefore we have to re-enable the filter after we are done encoding.
            $this->entityManager->getFilters()->enable('video_doctrine_filter');
        }
    }

    private function pingAndReconnectDB(): void
    {
        // WHY: The encoding process might take quite long and the db connection might have been
        // lost/closed in the meantime. Therefore we check if we still have a connection and
        // otherwise reconnect.
        if ($this->entityManager->getConnection()->isConnected() === false) {
            $this->entityManager->getConnection()->close();
            $this->entityManager->getConnection()->connect();
        }
    }
}
