<?php


namespace App\Mediathek\Controller;


use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Video\Video;
use App\Entity\Video\VideoSubtitles;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class SubtitleEditorController extends AbstractController
{
    private AppRuntime $appRuntime;
    private VideoRepository $videoRepository;
    private EntityManagerInterface $entityManager;
    private $eventStore;
    private LoggerInterface $logger;

    function __construct(AppRuntime $appRuntime, VideoRepository $videoRepository, EntityManagerInterface $entityManager, LoggerInterface $logger, DoctrineIntegratedEventStore $eventStore)
    {
        $this->appRuntime = $appRuntime;
        $this->videoRepository = $videoRepository;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
        $this->eventStore = $eventStore;
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
     * @Route("/subtitles/edit/{id}", name="mediathek__subtitle-editor--show")
     */
    public function show(Video $video): Response
    {
        $videoUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());

        if (empty($video->getSubtitles())) {
            // Initialize subtitles
            $video->setSubtitles(new VideoSubtitles());
        }

        return $this->render('Mediathek/SubtitleEditor/SubtitleEditor.html.twig', [
            'updateUrl' => $this->generateUrl("mediathek__subtitle-editor--update", [], UrlGeneratorInterface::ABSOLUTE_URL),
            'video' => $video,
            // Structure which is consumed by the frontend
            'videoMap' => [
                'id' => $video->getId(),
                'name' => $video->getTitle(),
                'description' => $video->getDescription(),
                'duration' => $video->getVideoDuration(),
                'subtitles' => $video->getSubtitles()->getSubtitles(),
                'url' => [
                    'hls' => $videoUrl . '/hls.m3u8',
                    'mp4' => $videoUrl . '/x264.mp4',
                ]
            ]
        ]);
    }
}
