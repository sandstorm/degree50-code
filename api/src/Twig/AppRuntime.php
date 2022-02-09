<?php


namespace App\Twig;

use App\Entity\VirtualizedFile;
use Twig\Extension\RuntimeExtensionInterface;

class AppRuntime implements RuntimeExtensionInterface
{
    public function __construct()
    {
        // this simple example doesn't define any dependency, but in your own
        // extensions, you'll need to inject services using this constructor
    }

    public function virtualizedFileUrl(?VirtualizedFile $virtualizedFile): ?string
    {
        if (!$virtualizedFile) {
            return null;
        }

        // TODO: hardcoded
        if ($virtualizedFile->getMountPoint() === 'uploaded_videos') {
            return '/var/data/persistent/videos/original/' . $virtualizedFile->getRelativePathAndFilename();
        }

        if ($virtualizedFile->getMountPoint() === 'uploaded_subtitles') {
            return '/var/data/persistent/subtitles/original/' . $virtualizedFile->getRelativePathAndFilename();
        }

        if ($virtualizedFile->getMountPoint() === 'uploaded_audio_descriptions') {
            return '/var/data/persistent/audio_descriptions/original/' . $virtualizedFile->getRelativePathAndFilename();
        }

        if ($virtualizedFile->getMountPoint() === 'encoded_videos') {
            return '/data/encoded_videos/' . $virtualizedFile->getRelativePathAndFilename();
        }

        if ($virtualizedFile->getMountPoint() === 'uploaded_material') {
            return '/data/material/' . $virtualizedFile->getRelativePathAndFilename();
        }

        return 'Error: FileUrl not configured! See <AppRuntime.php>.';
    }
}
