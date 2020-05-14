<?php

namespace App\Core;

use App\DependencyInjection\Compiler\FileSystemCompilerPass;
use App\Entity\VirtualizedFile;
use League\Flysystem\Adapter\Local;
use League\Flysystem\Filesystem;
use League\Flysystem\MountManager;
use Ramsey\Uuid\Uuid;

class FileSystemService
{
    private array $mountPrefixesAndFilesystems;
    private MountManager $mountManager;

    // name of file system mount which is guaranteed to be locally available
    const LOCAL_TMP_FILESYSTEM_MOUNT = 'local_tmp';

    public function __construct(MountManager $mountManager)
    {
        $this->mountPrefixesAndFilesystems = [];
        $this->mountManager = $mountManager;
    }

    /**
     * This method is called from {@see FileSystemCompilerPass}
     *
     * @param Filesystem $filesystem
     * @param string $mountPrefix
     * @internal
     */
    public function registerFilesystem(Filesystem $filesystem, string $mountPrefix): void
    {
        $this->mountPrefixesAndFilesystems[$mountPrefix] = $filesystem;
    }

    /**
     * Public API, to reverse-resolve the prefix for a file system.
     *
     * @param Filesystem $filesystem
     * @return string
     * @api
     */
    public function getMountPrefixForFilesystem(Filesystem $filesystem): string
    {
        $result = array_search($filesystem, $this->mountPrefixesAndFilesystems, true);

        if ($result === FALSE) {
            throw new \RuntimeException('given file system does not have a mount prefix assigned');
        }

        return $result;
    }

    /**
     * @param string $inputFilename in the format understandable by MountManager, like uploaded_videos://my_video.mp4
     * @return string a local path to the file.
     * @throws \League\Flysystem\FileExistsException
     */
    public function fetchIfNeededAndGetLocalPath(VirtualizedFile $inputFile): string
    {
        if ($this->mountManager->getAdapter($inputFile->getVirtualPathAndFilename()) instanceof Local) {

            // we do not need to do anything with a local file.
            return $this->localPath($inputFile);
        }

        $localTemporaryDirectory = $this->generateUniqueTemporaryDirectory();
        $localTemporaryFile = $localTemporaryDirectory->appendPathSegment($inputFile->getBasename());

        $this->mountManager->copy($inputFile->getVirtualPathAndFilename(), $localTemporaryFile);

        return $this->localPath($localTemporaryFile);
    }

    public function generateUniqueTemporaryDirectory(): VirtualizedFile
    {
        $directory = VirtualizedFile::fromMountPointAndFilename(self::LOCAL_TMP_FILESYSTEM_MOUNT, Uuid::uuid4()->toString());
        $result = $this->mountManager->createDir($directory->getVirtualPathAndFilename());
        assert($result, 'directory ' . $directory . ' could not be created');
        return $directory;
    }

    public function localPath(VirtualizedFile $inputFilename): string
    {
        $adapter = $this->mountManager->getAdapter($inputFilename->getVirtualPathAndFilename());

        if (!$adapter instanceof Local) {
            throw new \RuntimeException('File ' . $inputFilename . ' is not available locally.');
        }

        return $adapter->applyPathPrefix($inputFilename->getRelativePathAndFilename());
    }

    public function moveDirectory(VirtualizedFile $inputDirectory, VirtualizedFile $outputDirectory): void
    {
        foreach ($this->mountManager->listContents($inputDirectory->getVirtualPathAndFilename(), true) as $file) {
            $result = $this->mountManager->move($inputDirectory->getMountPoint() . '://' . $file['path'], $outputDirectory->getVirtualPathAndFilename() . '/' . $file['basename']);
            assert($result, 'Moving files failed');
        }
    }


}
