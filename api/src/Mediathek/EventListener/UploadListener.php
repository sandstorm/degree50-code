<?php


namespace App\Mediathek\EventListener;
use App\Utility\FileSystemService;
use App\VideoEncoding\Message\WebEncodingTask;
use Doctrine\Common\Persistence\ObjectManager;
use League\Flysystem\Filesystem;
use Oneup\UploaderBundle\Event\PostPersistEvent;
use Oneup\UploaderBundle\Event\PostUploadEvent;
use Symfony\Component\Messenger\MessageBusInterface;


class UploadListener
{
    private MessageBusInterface $messageBus;
    private FileSystemService $fileSystemService;

    public function __construct(MessageBusInterface $messageBus, FileSystemService $fileSystemService)
    {
        $this->messageBus = $messageBus;
        $this->fileSystemService = $fileSystemService;
    }


    public function onUpload(PostUploadEvent $event)
    {
        $id = $event->getRequest()->get('id');
        assert($id !== '', 'ID is set');

        $fileSystem = $event->getFile()->getFileSystem();



        assert($fileSystem instanceof Filesystem, "FileSystem must be a Flysystem FileSystem");
        $mountPrefix = $this->fileSystemService->getMountPrefixForFilesystem($fileSystem);

        $newFileName = sprintf('%s.%s',
            $id,
            $event->getFile()->getExtension()
        );

        $outputDirectory = sprintf('encoded_videos://%s',
            $id
        );

        $renamingSuccessful = $fileSystem->rename($event->getFile()->getPathname(), $newFileName);
        assert($renamingSuccessful, 'Renaming the file did not work');

        $response = $event->getResponse();

        $this->messageBus->dispatch(new WebEncodingTask(
            $mountPrefix . '://' . $newFileName,
            $outputDirectory
        ));

        $response['success'] = true;
        return $response;
    }
}
