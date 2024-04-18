<?php

namespace App\Domain\Video\Service;

use App\Domain\Exercise\Service\ExerciseService;
use App\Domain\ExercisePhase\Model\ExercisePhase;
use App\Domain\User\Model\User;
use App\Domain\Video\Model\Video;
use App\Domain\Video\Repository\VideoRepository;
use App\Domain\VideoFavorite\Service\VideoFavouritesService;
use App\Domain\VirtualizedFile\Model\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Twig\AppRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * This service handles operations on video entities.
 */
class VideoService
{
    const string VIDEO_DOCTRINE_FILTER_NAME = 'video_doctrine_filter';

    public function __construct(
        private readonly EntityManagerInterface       $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly VideoRepository              $videoRepository,
        private readonly AppRuntime                   $appRuntime,
        private readonly KernelInterface              $kernel,
        private readonly VideoFavouritesService       $videoFavouritesService,
        private readonly ExerciseService              $exerciseService,
    )
    {
    }

    /**
     * @param User $user
     * @return Video[]
     */
    public function getVideosCreatedByUserWithoutFilters(User $user): array
    {
        $this->entityManager->getFilters()->disable(self::VIDEO_DOCTRINE_FILTER_NAME);
        $videos = $this->videoRepository->findBy(['creator' => $user]);
        $this->entityManager->getFilters()->enable(self::VIDEO_DOCTRINE_FILTER_NAME);

        return $videos;
    }

    public function deleteVideosCreatedByUser(User $user): void
    {
        $videosCreatedByUser = $this->getVideosCreatedByUserWithoutFilters($user);

        foreach ($videosCreatedByUser as $video) {
            $this->deleteVideo($video);
        }
    }

    /**
     * Removes a video entity along with its encoded video directory.
     * Also removes all exercises that are associated with the video.
     */
    public function deleteVideo(Video $video): void
    {
        $exercisePhases = $video->getExercisePhases();
        $exercisesToDelete = [];
        // loop over exercisePhases and get the exercises
        /** @var ExercisePhase $exercisePhase */
        foreach ($exercisePhases as $exercisePhase) {
            $exercise = $exercisePhase->getBelongsToExercise();
            $exercisesToDelete[$exercise->getId()] = $exercise;
        }

        foreach ($exercisesToDelete as $exercise) {
            $this->exerciseService->deleteExercise($exercise);
        }

        // remove VideoFavourites
        $this->videoFavouritesService->removeVideoFavoritesOfVideo($video);

        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());
        $this->removeVideoFile($fileUrl);

        $this->eventStore->addEvent('VideoDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->remove($video);
        $this->entityManager->flush();
    }

    /**
     * This method removes the originally uploaded video file from the file system.
     * Note: This does not affect any encoded files.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function removeOriginalVideoFile(Video $video): void
    {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getUploadedVideoFile());
        $filesystem = new Filesystem();
        $filesystem->remove($this->kernel->getProjectDir() . $fileUrl);

        $video->setUploadedVideoFile(null);

        $this->eventStore->addEvent('VideoDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    /**
     * This method removes the originally uploaded subtitle file from the file system.
     * Note: This does not affect the subtitles.vtt file wich is created inside
     * the encoded_videos/<id> directory upon encoding!
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function removeOriginalSubtitleFile(Video $video): void
    {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getUploadedSubtitleFile());
        $filesystem = new Filesystem();
        $filesystem->remove($this->kernel->getProjectDir() . $fileUrl);

        $video->setUploadedSubtitleFile(null);

        $this->eventStore->addEvent('SubtitleDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    /**
     * Persists the an uploaded video file to the respective video and also sets some basic properties like <creator> and dataPrivacy properties.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function persistUploadedVideoFile(
        Video           $video,
        VirtualizedFile $uploadedVideoFile,
        User            $user,
    ): Video
    {
        $video->setCreator($user);
        $video->setUploadedVideoFile($uploadedVideoFile);
        $video->setDataPrivacyAccepted(false);
        $video->setDataPrivacyPermissionsAccepted(false);

        $this->eventStore->addEvent('VideoUploaded', [
            'videoId' => $video->getId(),
            'uploadedVideoFile' => $video->getUploadedVideoFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();

        return $video;
    }

    /**
     * Persists the an uploaded subtitle file to the respective video and also sets some basic properties like <creator> and dataPrivacy properties.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function persistUploadedSubtitleFile(
        Video           $video,
        VirtualizedFile $uploadedSubtitleFile,
        User            $user
    ): void
    {
        $video->setCreator($user);
        $video->setUploadedSubtitleFile($uploadedSubtitleFile);
        $video->setDataPrivacyAccepted(false);
        $video->setDataPrivacyPermissionsAccepted(false);

        $this->eventStore->addEvent('SubtitleUploaded', [
            'videoId' => $video->getId(),
            'uploadedSubtitleFile' => $video->getUploadedSubtitleFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    private function removeVideoFile(string $fileUrl): void
    {
        $publicResourcesFolderPath = $this->kernel->getProjectDir() . '/public/';

        $filesystem = new Filesystem();
        $filesystem->remove($publicResourcesFolderPath . $fileUrl);
    }

    /**
     * Persists the an uploaded audio file to the respective video and also sets some basic properties like <creator> and dataPrivacy properties.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function persistUploadedAudioDescriptionFile(
        ?Video          $video,
        VirtualizedFile $uploadedAudioDescriptionFile,
        User            $user
    ): void
    {
        $video->setCreator($user);
        $video->setUploadedAudioDescriptionFile($uploadedAudioDescriptionFile);
        $video->setDataPrivacyAccepted(false);
        $video->setDataPrivacyPermissionsAccepted(false);

        $this->eventStore->addEvent('AudioDescriptionUploaded', [
            'videoId' => $video->getId(),
            'uploadedAudioDescriptionFile' => $video->getUploadedAudioDescriptionFile()->getVirtualPathAndFilename(),
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }

    /**
     * This method removes the originally uploaded audio description file from the file system.
     *
     * @see {App\Mediathek\Controller\VideoUploadController}
     */
    public function removeOriginalAudioDescriptionFile(Video $video): void
    {
        $fileUrl = $this->appRuntime->virtualizedFileUrl($video->getUploadedAudioDescriptionFile());
        $filesystem = new Filesystem();
        $filesystem->remove($this->kernel->getProjectDir() . $fileUrl);

        $video->setUploadedAudioDescriptionFile(null);

        $this->eventStore->addEvent('AudioDescriptionDeleted', [
            'videoId' => $video->getId(),
            'uploadedFile' => $fileUrl
        ]);

        $this->entityManager->persist($video);
        $this->entityManager->flush();
    }
}
