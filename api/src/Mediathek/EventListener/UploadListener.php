<?php


namespace App\Mediathek\EventListener;
use App\Core\FileSystemService;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Video\VideoRepository;
use App\VideoEncoding\Message\WebEncodingTask;
use Doctrine\ORM\EntityManagerInterface;
use League\Flysystem\Filesystem;
use Oneup\UploaderBundle\Event\PostUploadEvent;
use Symfony\Component\Messenger\MessageBusInterface;


class UploadListener
{
    private MessageBusInterface $messageBus;
    private FileSystemService $fileSystemService;
    private EntityManagerInterface $entityManager;
    private VideoRepository $videoRepository;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(MessageBusInterface $messageBus, FileSystemService $fileSystemService, EntityManagerInterface $entityManager, VideoRepository $videoRepository, DoctrineIntegratedEventStore $eventStore)
    {
        $this->messageBus = $messageBus;
        $this->fileSystemService = $fileSystemService;
        $this->entityManager = $entityManager;
        $this->videoRepository = $videoRepository;
        $this->eventStore = $eventStore;
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

        assert($fileSystem instanceof Filesystem, "FileSystem must be a Flysystem FileSystem");
        $mountPrefix = $this->fileSystemService->getMountPrefixForFilesystem($fileSystem);

        $targetFileName = sprintf('%s.%s',
            $id,
            $event->getFile()->getExtension()
        );
        $uploadedVideoFile = VirtualizedFile::fromMountPointAndFilename($mountPrefix, $targetFileName);

        $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $id);

        $renamingSuccessful = $fileSystem->rename($event->getFile()->getPathname(), $targetFileName);
        assert($renamingSuccessful, 'Renaming the file did not work');

        $response = $event->getResponse();

        $video->setUploadedVideoFile($uploadedVideoFile);
        $video->setDataPrivacyAccepted(false);

        $this->eventStore->addEvent('VideoUploaded', [
            'videoId' => $video->getId(),
            'uploadedVideoFile' => $video->getUploadedVideoFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();

        $this->messageBus->dispatch(new WebEncodingTask($video->getId(), $outputDirectory));

        $response['success'] = true;
        return $response;
    }
}
