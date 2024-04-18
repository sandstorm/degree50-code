<?php

namespace App\Tests\Behat;

use App\Domain\Video\Model\Video;
use App\Domain\Course\Model\Course;
use App\Domain\User\Model\User;
use App\Domain\Exercise\ExercisePhase;
use App\Domain\Solution\Model\Solution;
use App\Domain\VirtualizedFile\Model\VirtualizedFile;

use function PHPUnit\Framework\assertEmpty;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertNotEmpty;

/**
 *
 */
trait VideoContextTrait
{
    /**
     * @Given I have a video with ID :videoId belonging exercisePhase with ID :exercisePhaseId
     *
     * NOTE: The video you are trying to add needs to be available inside the same course, the
     * exercisePhase belongs to
     */
    public function iHaveAVideoWithIdBelongingToExercisePhaseWithId($videoId, $exercisePhaseId)
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);
        /** @var Video $video */
        $video = $this->entityManager->find(Video::class, $videoId);

        // check if video exists
        assertEquals($videoId, $video->getId());

        $exercisePhase->addVideo($video);

        $this->entityManager->persist($exercisePhase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a video with ID :videoId belonging to course :courseId
     */
    public function iHaveAVideoRememberingItsIDAsVIDEOID($videoId, $courseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        $video = $this->ensureVideoByUserExists($videoId, $this->currentUser->getId());

        if ($course) {
            $video->addCourse($course);
        }

        $this->entityManager->persist($video);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given A Video with ID :videoId created by User :username exists
     */
    public function ensureVideoByUserExists($videoId, $username): Video
    {
        /** @var Video $video */
        $video = $this->entityManager->find(Video::class, $videoId);

        if (!$video) {
            $user = $this->getUserByEmail($username);
            // fixed creation date for video
            $now = new \DateTimeImmutable();
            $creationDateForVideo = $now->setTimestamp(1711960922); // 2024-04-01 08:42:02

            $video = new Video($videoId);
            $video->setCreator($user);
            $video->setDataPrivacyAccepted(true);
            $video->setDataPrivacyPermissionsAccepted(true);
            $video->setTitle('TEST_Video_' . $videoId);
            $video->setEncodingStatus(Video::ENCODING_FINISHED);
            $video->setCreatedAt($creationDateForVideo);
            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
            $video->setEncodedVideoDirectory($outputDirectory);

            $this->entityManager->persist($video);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();
        }

        return $video;
    }

    /**
     * @Then No Video created by User :username should exist
     */
    public function assertVideosByUserDoNotExist($username)
    {
        /**
         * Why
         * We want to find _all_ Videos of the user without doctrine filtering out any of them
         */
        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $videos = $this->videoRepository->findAll();
        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        /**
         * Why
         * @see assertExercisesByUserDoNotExist $exercises
         */
        $videosCreatedByUser = array_filter(
            $videos,
            function (Video $video) use ($username) {
                return $video->getCreator() === $username;
            }
        );

        assertEquals(0, count($videosCreatedByUser));
    }

    /**
     * Creates a cut video for the currently logged in user (use the according step to log in first)
     *
     * @Given I have a cut video :cutVideoId belonging to solution :solutionId
     */
    public function iHaveACutVideoBelongingToSolution($cutVideoId, $solutionId)
    {
        // NOTE: we do not save a video file here only the wrapping model,
        // because we do not test for the file itself!
        $cutVideo = $this->ensureVideoByUserExists($cutVideoId, $this->currentUser->getId());

        /** @var Solution $solution */
        $solution = $this->entityManager->find(Solution::class, $solutionId);
        $solution->setCutVideo($cutVideo);

        $this->entityManager->persist($solution);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then I only receive the regular video :videoId and not the cut video :cutVideoId for creator :userId
     */
    public function iOnlyReceiveTheRegularVideoAndNotTheCutVideoForCreator($videoId, $cutVideoId, $userId): void
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $userId);

        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $queryResult = $this->videoRepository->findByCreatorWithoutCutVideos($user);
        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        assertNotEmpty($queryResult, 'Query result is empty!');

        $filteredByCutId = array_filter($queryResult, function ($video) use ($cutVideoId) {
            return $video->getId() === $cutVideoId;
        });

        assertEmpty($filteredByCutId, 'Cut video was found. (Should not be part of result!)');

        $filteredByVideoId = array_filter($queryResult, function ($video) use ($videoId) {
            return $video->getId() === $videoId;
        });

        assertNotEmpty($filteredByVideoId, 'Regular video was not found. (Should be part of result!)');
        assertEquals($videoId, $filteredByVideoId[0]->getId());
        assertEquals($userId, $filteredByVideoId[0]->getCreator()->getId());
    }

    /**
     * @When I delete the video :videoId
     */
    public function iDeleteTheVideo($videoId): void
    {
        $video = $this->videoRepository->find($videoId);
        assertEquals($videoId, $video->getId());
        $this->videoService->deleteVideo($video);
    }

    /**
     * @Then The video :videoId is deleted
     */
    public function theVideoShouldIsDeleted($videoId): void
    {
        $video = $this->videoRepository->find($videoId);
        assertEquals(null, $video);
    }
}
