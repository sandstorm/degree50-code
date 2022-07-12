<?php

namespace App\Tests\Behat;

use App\Entity\Video\Video;
use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\Solution;
use App\Entity\VirtualizedFile;
use App\Repository\Video\VideoRepository;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

use function PHPUnit\Framework\assertEmpty;
use function PHPUnit\Framework\assertEquals;

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
        /** @var Video $video */
        $video = $this->entityManager->find(Video::class, $videoId);

        if (!$video) {
            $video = new Video($videoId);
            $video->setDataPrivacyAccepted(true);
            $video->setDataPrivacyPermissionsAccepted(true);
            $video->setCreator($this->security->getUser());
            $video->setTitle('TEST_Video_' . $videoId);
            $video->setEncodingStatus(Video::ENCODING_FINISHED);
            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
            $video->setEncodedVideoDirectory($outputDirectory);
        }

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
    public function ensureVideoByUserExists($videoId, $username)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $video = new Video($videoId);
        $video->setCreator($user);
        $video->setDataPrivacyAccepted(true);
        $video->setDataPrivacyPermissionsAccepted(true);
        $video->setTitle('TEST: CutVideo');
        $video->setEncodingStatus(Video::ENCODING_FINISHED);
        $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
        $video->setEncodedVideoDirectory($outputDirectory);

        $this->entityManager->persist($video);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then No Video created by User :username should exist
     */
    public function assertVideosByUserDoNotExist($username)
    {
        /** @var VideoRepository $videoRepository */
        $videoRepository = $this->entityManager->getRepository(Video::class);

        /**
         * Why
         * We want to find _all_ Videos of the user without doctrine filtering out any of them
         */
        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $videos = $videoRepository->findAll();
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
     * @When I find videos by creator :userId without cut videos
     */
    public function iFindVideosByCreatorWithoutCutVideos($userId)
    {
        /** @var VideoRepository $videoRepository */
        $videoRepository = $this->entityManager->getRepository(Video::class);
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $userId);

        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $this->queryResult = $videoRepository->findByCreatorWithoutCutVideos($user);
        $this->entityManager->getFilters()->enable('video_doctrine_filter');
    }

    /**
     * @Given I have a cut video :cutVideoId belonging to solution :solutionId
     */
    public function iHaveACutVideoBelongingToSolution($cutVideoId, $solutionId)
    {
        /** @var TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $loggedInUser = $tokenStorage->getToken()->getUser();

        // NOTE: we do not save a video file here only the wrapping model,
        // because we do not test for the file itself!
        $cutVideo = new Video($cutVideoId);
        $cutVideo->setCreator($loggedInUser);
        $cutVideo->setDataPrivacyAccepted(true);
        $cutVideo->setDataPrivacyPermissionsAccepted(true);
        $cutVideo->setTitle('TEST: CutVideo');
        $cutVideo->setEncodingStatus(Video::ENCODING_FINISHED);
        $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $cutVideo->getId());
        $cutVideo->setEncodedVideoDirectory($outputDirectory);

        /** @var Solution $solution */
        $solution = $this->entityManager->find(Solution::class, $solutionId);

        $solution->setCutVideo($cutVideo);

        $this->entityManager->persist($cutVideo);
        $this->entityManager->persist($solution);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then I only receive the regular video :videoId and not the cut video :cutVideoId
     */
    public function iOnlyReceiveTheRegularVideoAndNotTheCutVideo($videoId, $cutVideoId)
    {
        assert(!empty($this->queryResult), 'Query result is empty!');

        $filteredByCutId = array_filter($this->queryResult, function ($video) use ($cutVideoId) {
            return $video->getId() === $cutVideoId;
        });

        assertEmpty($filteredByCutId, 'Cut video was found. (Should not be part of result!)');

        /** @var Video $firstVideo */
        $firstVideo = current($this->queryResult);
        assertEquals($videoId, $firstVideo->getId());
    }
}
