<?php


namespace App\Mediathek\EventListener;
use App\Core\FileSystemService;
use App\Entity\Account\User;
use App\Entity\Exercise\Material;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Mediathek\Controller\VideoUploadController;
use App\Mediathek\Service\VideoService;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Video\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use League\Flysystem\Filesystem;
use Oneup\UploaderBundle\Event\PostUploadEvent;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Security;

/**
 * This listener handles the upload of subtitle, material and video files inside the video upload form
 * of our mediathek. The dropzone handling is done inside the VideoUploadController.js and SubtitlesUploadController.js frontend files.
 * The data these controllers use is provided by https://github.com/1up-lab/OneupUploaderBundle/ inside the VideoUpload.html.twig-Template.
 *
 * The actual video form is handled by
 * @see VideoUploadController
 */
class UploadListener
{
    private Security $security;
    private FileSystemService $fileSystemService;
    private EntityManagerInterface $entityManager;
    private VideoRepository $videoRepository;
    private DoctrineIntegratedEventStore $eventStore;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private VideoService $videoService;
    private LoggerInterface $logger;

    const TARGET_VIDEO = 'video';
    const TARGET_MATERIAL = 'material';
    const TARGET_SUBTITLE = 'subtitle';

    public function __construct(
        FileSystemService $fileSystemService,
        EntityManagerInterface $entityManager,
        VideoRepository $videoRepository,
        DoctrineIntegratedEventStore $eventStore,
        Security $security,
        ExercisePhaseRepository $exercisePhaseRepository,
        VideoService $videoService,
        LoggerInterface $logger
    )
    {
        $this->fileSystemService = $fileSystemService;
        $this->entityManager = $entityManager;
        $this->videoRepository = $videoRepository;
        $this->eventStore = $eventStore;
        $this->security = $security;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->videoService = $videoService;
        $this->logger = $logger;
    }

    public function onUpload(PostUploadEvent $event)
    {
        $target = $event->getRequest()->get('target');
        /* @var User $user */
        $user = $this->security->getUser();

        switch ($target) {
            case self::TARGET_VIDEO:
                return $this->uploadVideo($event, $user);
            case self::TARGET_SUBTITLE:
                return $this->uploadSubtitle($event, $user);
            case self::TARGET_MATERIAL:
                return $this->uploadMaterial($event, $user);
        }
    }

    private function uploadMaterial(PostUploadEvent $event, User $user)
    {
        /* @var Request $request */
        $request = $event->getRequest();

        /* @var UploadedFile $originalFile */
        $originalFile = $request->files->get('file');

        $material = new Material();
        $material->setCreator($user);
        $material->setMimeType($originalFile->getClientMimeType());
        $material->setName($originalFile->getClientOriginalName());

        $phaseId = $request->get('phaseId');
        $exercisePhase = $this->exercisePhaseRepository->find($phaseId);
        $material->setExercisePhase($exercisePhase);

        $uploadedFile = $this->uploadFile($material->getId(), $event);
        $material->setUploadedFile($uploadedFile);

        $this->eventStore->addEvent('MaterialUploaded', [
            'materialId' => $material->getId(),
            'uploadedFile' => $material->getUploadedFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($material);
        $this->entityManager->flush();

        $response = $event->getResponse();
        $response['success'] = true;
        $response['materialId'] = $material->getId();
        return $response;
    }

    private function uploadSubtitle(PostUploadEvent $event, User $user)
    {
        $id = $event->getRequest()->get('id');
        assert($id !== '', 'ID is set');

        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $video = $this->videoRepository->find($id);

        if (!$video) {
            $video = new Video($id);
        }

        $uploadedSubtitleFile = $this->uploadFile($id, $event);

        $this->videoService->persistUploadedSubtitleFile($video, $uploadedSubtitleFile, $user);

        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        $response = $event->getResponse();
        $response['success'] = true;
        return $response;
    }

    private function uploadVideo(PostUploadEvent $event, User $user)
    {
        $id = $event->getRequest()->get('id');
        assert($id !== '', 'ID is set');

        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $video = $this->videoRepository->find($id);

        if (!$video) {
            $video = new Video($id);
        }

        $uploadedVideoFile = $this->uploadFile($id, $event);

        $this->videoService->persistUploadedVideoFile($video, $uploadedVideoFile, $user);

        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        $response = $event->getResponse();
        $response['success'] = true;
        return $response;
    }

    private function uploadFile(string $fileName, PostUploadEvent $event)
    {
        $fileSystem = $event->getFile()->getFileSystem();
        assert($fileSystem instanceof Filesystem, "FileSystem must be a Flysystem FileSystem");
        $mountPrefix = $this->fileSystemService->getMountPrefixForFilesystem($fileSystem);

        $targetFileName = sprintf('%s.%s',
            $fileName,
            $event->getFile()->getExtension()
        );
        $uploadedFile = VirtualizedFile::fromMountPointAndFilename($mountPrefix, $targetFileName);

        $renamingSuccessful = $fileSystem->rename($event->getFile()->getPathname(), $targetFileName);
        assert($renamingSuccessful, 'Renaming the file did not work');

        return $uploadedFile;
    }
}
