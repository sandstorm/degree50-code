<?php


namespace App\Mediathek\EventListener;
use App\Core\FileSystemService;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use League\Flysystem\Filesystem;
use Oneup\UploaderBundle\Event\PostUploadEvent;
use Symfony\Component\Security\Core\Security;

class UploadListener
{
    private Security $security;
    private FileSystemService $fileSystemService;
    private EntityManagerInterface $entityManager;
    private VideoRepository $videoRepository;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(FileSystemService $fileSystemService, EntityManagerInterface $entityManager, VideoRepository $videoRepository, DoctrineIntegratedEventStore $eventStore, Security $security)
    {
        $this->fileSystemService = $fileSystemService;
        $this->entityManager = $entityManager;
        $this->videoRepository = $videoRepository;
        $this->eventStore = $eventStore;
        $this->security = $security;

    }


    public function onUpload(PostUploadEvent $event)
    {
        $id = $event->getRequest()->get('id');
        assert($id !== '', 'ID is set');

        $fileSystem = $event->getFile()->getFileSystem();

        $video = $this->videoRepository->find($id);
        if (!$video) {
            $video = new Video($id);
        }
        $video->setCreator($this->security->getUser());

        assert($fileSystem instanceof Filesystem, "FileSystem must be a Flysystem FileSystem");
        $mountPrefix = $this->fileSystemService->getMountPrefixForFilesystem($fileSystem);

        $targetFileName = sprintf('%s.%s',
            $id,
            $event->getFile()->getExtension()
        );
        $uploadedVideoFile = VirtualizedFile::fromMountPointAndFilename($mountPrefix, $targetFileName);

        $renamingSuccessful = $fileSystem->rename($event->getFile()->getPathname(), $targetFileName);
        assert($renamingSuccessful, 'Renaming the file did not work');

        $response = $event->getResponse();

        $video->setUploadedVideoFile($uploadedVideoFile);
        $video->setDataPrivacyAccepted(false);

        $this->eventStore->addEvent('VideoUploaded', [
            'videoId' => $id,
            'uploadedVideoFile' => $video->getUploadedVideoFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();

        $response['success'] = true;
        return $response;
    }
}
