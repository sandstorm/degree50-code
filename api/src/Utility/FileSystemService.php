<?php

namespace App\Utility;

use App\DependencyInjection\Compiler\FileSystemCompilerPass;
use League\Flysystem\Adapter\Local;
use League\Flysystem\Filesystem;
use League\Flysystem\MountManager;
use Ramsey\Uuid\Uuid;

class FileSystemService
{
    private array $mountPrefixesAndFilesystems;
    private MountManager $mountManager;

    // name of file system mount which is guaranteed to be locally available
    const LOCAL_TMP_FILESYSTEM_MOUNT = 'local_tmp://';

    public function __construct(MountManager $mountManager)
    {
        $this->mountPrefixesAndFilesystems = [];
        $this->mountManager = $mountManager;
    }

    /**
     * This method is called from {@see FileSystemCompilerPass}
     *
     * @internal
     */
    public function registerFilesystem(Filesystem $filesystem, $mountPrefix)
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
    public function fetchIfNeededAndGetLocalPath(string $inputFilename): string
    {
        if ($this->mountManager->getAdapter($inputFilename) instanceof Local) {

            // we do not need to do anything with a local file.
            return $this->localPath($inputFilename);
        }

        [, $filename] = explode('://', $inputFilename, 2);
        $this->mountManager->copy($inputFilename, self::LOCAL_TMP_FILESYSTEM_MOUNT . $filename);

        return $this->localPath(self::LOCAL_TMP_FILESYSTEM_MOUNT . $filename);
    }

    public function generateUniqueTemporaryDirectory(): string
    {
        $directory = self::LOCAL_TMP_FILESYSTEM_MOUNT . Uuid::uuid4()->toString();
        $result = $this->mountManager->createDir($directory);
        assert($result, 'directory ' . $directory . ' could not be created');
        return $directory;
    }

    public function localPath($inputFilename): string
    {
        [, $filename] = explode('://', $inputFilename, 2);
        $adapter = $this->mountManager->getAdapter($inputFilename);

        if (!$adapter instanceof Local) {
            throw new \RuntimeException('File ' . $inputFilename . ' is not available locally.');
        }

        return $adapter->applyPathPrefix($filename);
    }

    public function moveDirectory($inputDirectory, $outputDirectory)
    {
        [$inputPrefix, ] = explode('://', $inputDirectory, 2);
        foreach ($this->mountManager->listContents($inputDirectory, true) as $file) {
            $result = $this->mountManager->move($inputPrefix . '://' . $file['path'], $outputDirectory . '/' . $file['basename']);
            assert($result, 'Moving files failed');
        }
    }


}
