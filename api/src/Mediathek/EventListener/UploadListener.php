<?php


namespace App\Mediathek\EventListener;
use App\Core\FileSystemService;
use App\Entity\Account\User;
use App\Entity\Exercise\Material;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Video\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use League\Flysystem\Filesystem;
use Oneup\UploaderBundle\Event\PostUploadEvent;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Security;

class UploadListener
{
    private Security $security;
    private FileSystemService $fileSystemService;
    private EntityManagerInterface $entityManager;
    private VideoRepository $videoRepository;
    private DoctrineIntegratedEventStore $eventStore;
    private ExercisePhaseRepository $exercisePhaseRepository;

    const TARGET_VIDEO = 'video';
    const TARGET_MATERIAL = 'material';

    public function __construct(FileSystemService $fileSystemService, EntityManagerInterface $entityManager, VideoRepository $videoRepository, DoctrineIntegratedEventStore $eventStore, Security $security, ExercisePhaseRepository $exercisePhaseRepository)
    {
        $this->fileSystemService = $fileSystemService;
        $this->entityManager = $entityManager;
        $this->videoRepository = $videoRepository;
        $this->eventStore = $eventStore;
        $this->security = $security;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
    }

    public function onUpload(PostUploadEvent $event)
    {
        $target = $event->getRequest()->get('target');
        /* @var User $user */
        $user = $this->security->getUser();

        switch ($target) {
            case self::TARGET_VIDEO:
                return $this->uploadVideo($event, $user);
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

    private function uploadVideo(PostUploadEvent $event, User $user)
    {
        $id = $event->getRequest()->get('id');
        assert($id !== '', 'ID is set');

        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $video = $this->videoRepository->find($id);
        if (!$video) {
            $video = new Video($id);
        }
        $video->setCreator($user);

        $uploadedVideoFile = $this->uploadFile($id, $event);

        $video->setUploadedVideoFile($uploadedVideoFile);
        $video->setDataPrivacyAccepted(false);
        $video->setDataPrivacyPermissionsAccepted(false);

        $this->eventStore->addEvent('VideoUploaded', [
            'videoId' => $id,
            'uploadedVideoFile' => $video->getUploadedVideoFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
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
