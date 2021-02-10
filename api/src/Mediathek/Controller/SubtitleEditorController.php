<?php


namespace App\Mediathek\Controller;

use App\Core\FileSystemService;
use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Video\Video;
use App\Entity\Video\VideoSubtitles;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

// NOTE: the frontend for this has currently been removed
// because the editor is broken due to large refactorings and is currently
// unclear if it will be used again.
//
// If it won't be needed any longer make sure to also remove this code!

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 */
class SubtitleEditorController extends AbstractController
{
    private AppRuntime $appRuntime;
    private VideoRepository $videoRepository;
    private EntityManagerInterface $entityManager;
    private $eventStore;
    private LoggerInterface $logger;
    private FileSystemService $fileSystemService;

    function __construct(AppRuntime $appRuntime, VideoRepository $videoRepository, EntityManagerInterface $entityManager, LoggerInterface $logger, DoctrineIntegratedEventStore $eventStore, FileSystemService $fileSystemService)
    {
        $this->appRuntime = $appRuntime;
        $this->videoRepository = $videoRepository;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
        $this->eventStore = $eventStore;
        $this->fileSystemService= $fileSystemService;
    }

    /**
     * @Route("/subtitles/update", name="mediathek__subtitle-editor--update", methods={"POST"})
     */
    public function update(Request $request) {
        try {
            $data = json_decode($request->getContent(), true);
            $videoId = $data['videoId'];
            $video = $this->videoRepository->find($videoId);

            $subtitles = new VideoSubtitles();
            $subtitles->setSubtitles($data['subtitles']);

            $video->setSubtitles($subtitles);

            $this->eventStore->addEvent('VideoSubtitlesEdited', [
                'videoId' => $video->getId(),
                'subtitles' => $subtitles->getSubtitles(),
            ]);

            $this->entityManager->persist($video);
            $this->entityManager->flush();

            return $this->json([
                'updatedVideoId' => $video->getId(),
                'updatedSubtitles' => $data['subtitles']
            ], 200);
        } catch (\Exception $exception) {
            $this->logger->error('Error: ' . $exception->getCode() . ', ' . $exception->getMessage());
            return $this->json([], 500);
        }
    }

    /**
     * @Route("/subtitles/persist/{id}", name="mediathek__subtitle-editor--persist-vtt", methods={"GET"})
     */
    public function persistVtt(Video $video) {

        try {
            $subtitles = $video->getSubtitles()->getSubtitles();
            $vttString = 'WEBVTT'. PHP_EOL . PHP_EOL;

            foreach ($subtitles as $index => $subtitle) {
                $vttString = $vttString . ($index + 1) . PHP_EOL;
                $vttString = $vttString . $subtitle['start'] . ' --> ' . $subtitle['end'] . PHP_EOL;
                $vttString = $vttString . $subtitle['text'] . PHP_EOL . PHP_EOL;
            }

            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
            $localOutputDirectory = $this->fileSystemService->localPath($outputDirectory);

            if (!file_exists($localOutputDirectory)) {
                mkdir($localOutputDirectory, 0777, true);
            }

            $path = $localOutputDirectory . '/subtitles.vtt';

            file_put_contents($path, $vttString);
        } catch (\Exception $exception) {
            $this->logger->error($exception->getMessage());
        }

        return $this->redirectToRoute('mediathek--index');
    }

    /**
     * @Route("/subtitles/edit/{id}", name="mediathek__subtitle-editor--show", methods={"GET"})
     */
    public function show(Video $video): Response
    {

        return $this->render('Mediathek/SubtitleEditor/SubtitleEditor.html.twig', [
            'updateUrl' => $this->generateUrl("mediathek__subtitle-editor--update", [], UrlGeneratorInterface::ABSOLUTE_URL),
            'video' => $video,
            // Structure which is consumed by the frontend
            'videoMap' => $video->getAsArray($this->appRuntime)
        ]);
    }
}
