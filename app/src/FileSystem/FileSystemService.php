<?php

namespace App\FileSystem;

use App\DependencyInjection\Compiler\FileSystemCompilerPass;
use App\Domain\VirtualizedFile;
use League\Flysystem\Adapter\Local;
use League\Flysystem\FileExistsException;
use League\Flysystem\Filesystem;
use League\Flysystem\MountManager;
use Ramsey\Uuid\Uuid;
use RuntimeException;

class FileSystemService
{
    private array $mountPrefixesAndFilesystems;

    // Name of file system mount which is guaranteed to be locally available,
    // because it is defined inside oneup_flysystem.yaml.
    const LOCAL_TMP_FILESYSTEM_MOUNT = 'local_tmp';

    public function __construct(
        private readonly MountManager $mountManager
    )
    {
        $this->mountPrefixesAndFilesystems = [];
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
            throw new RuntimeException('given file system does not have a mount prefix assigned');
        }

        return $result;
    }

    /**
     * @param VirtualizedFile $inputFile
     * @return string a local path to the file.
     * @throws FileExistsException
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
            throw new RuntimeException('File ' . $inputFilename . ' is not available locally.');
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
