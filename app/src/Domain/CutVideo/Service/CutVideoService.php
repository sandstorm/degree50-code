<?php

namespace App\Domain\CutVideo\Service;

use App\Domain\CutVideo\Repository\CutVideoRepository;
use App\Domain\Video\Model\Video;
use App\FileSystem\FileSystemService;

/**
 * This service handles operations on video entities.
 */
readonly class CutVideoService
{
    public function __construct(
        private FileSystemService  $fileSystemService,
        private CutVideoRepository $cutVideoRepository,
    )
    {
    }

    public function deleteCutVideosOfOriginalVideo(Video $video): void
    {
        $cutVideos = $this->cutVideoRepository->findBy(['originalVideo' => $video]);

        foreach ($cutVideos as $cutVideo) {
            $this->fileSystemService->deleteDirectory($cutVideo->getEncodedVideoDirectory());
            $this->cutVideoRepository->deleteCutVideo($cutVideo);
        }
    }
}
