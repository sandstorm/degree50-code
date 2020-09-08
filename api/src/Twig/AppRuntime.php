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

    public function virtualizedFileUrl(?VirtualizedFile $virtualizedFile)
    {
        if (!$virtualizedFile) {
            return null;
        }

        // TODO: hardcoded
        if ($virtualizedFile->getMountPoint() === 'encoded_videos') {
            return '/data/encoded_videos/' . $virtualizedFile->getRelativePathAndFilename();
        }

        if ($virtualizedFile->getMountPoint() === 'uploaded_material') {
            return '/data/material/' . $virtualizedFile->getRelativePathAndFilename();
        }

        return 'foo';
    }
}
