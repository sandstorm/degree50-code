<?php

namespace App\Tests\Behat;

use ApiPlatform\Core\Exception\InvalidArgumentException;
use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Attachment;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Video\Video;
use App\Security\Voter\DataPrivacyVoter;
use App\Security\Voter\TermsOfUseVoter;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertNotEquals;

/**
 *
 */
trait UserContextTrait
{
    private function createUser(string $username, string $password = null, bool $acceptPrivacyAndTerms = false): User
    {
        $user = new User($username);
        $user->setEmail($username);
        $user->setPassword($this->userPasswordHasher->hashPassword($user, $password ?? 'password'));

        // TODO: Put in separate step
        if ($acceptPrivacyAndTerms) {
            // accept current Privacy & Terms
            $user->setDataPrivacyAccepted(true);
            $user->setDataPrivacyVersion(DataPrivacyVoter::DATA_PRIVACY_VERSION);
            $user->setTermsOfUseAccepted(true);
            $user->setTermsOfUseVersion(TermsOfUseVoter::TERMS_OF_USE_VERSION);
        }

        $this->entityManager->persist($user);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();

        return $user;
    }

    /**
     * @Given A user :username exists
     */
    public function aUserExists(string $username)
    {
        $user = $this->entityManager->find(User::class, $username);
        if (!$user) {
            $this->createUser($username, null, true);
        }
    }


    /**
     * @Given A User :username with the role :role exists
     */
    public function aUserWithTheRoleExists($username, $role)
    {
        // create user if it does not exist
        $this->aUserExists($username);

        // add the role
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);
        $user->setRoles([$role]);

        // persist
        $this->entityManager->persist($user);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @When I delete User :username
     */
    public function iDeleteUser($username)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $this->userService->removeUser($user);
    }

    /**
     * @Given The User :username has CourseRole :courseRole in Course :courseId
     */
    public function userHasCourseRole($username, $courseRoleRole, $courseId)
    {
        if (!in_array($courseRoleRole, CourseRole::ROLES)) {
            throw new InvalidArgumentException(
                'Invalid CourseRole! Expected one of [' .
                    implode(', ', CourseRole::ROLES) .
                    ']. Given: "' . $courseRoleRole . '".'
            );
        }

        /* @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        /* @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $courseRole = new CourseRole();
        $courseRole->setCourse($course);
        $courseRole->setUser($user);
        $courseRole->setName($courseRoleRole);

        $user->addCourseRole($courseRole);

        $this->entityManager->persist($courseRole);
        $this->entityManager->persist($user);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then User :username should not exist
     */
    public function assertUserDoesNotExist($username)
    {
        assertEquals(null, $this->entityManager->find(User::class, $username));
    }

    /**
     * @Then No CourseRole of User :username exists
     *
     * TODO: userId vs userName? It's the same string but not the same meaning.
     */
    public function assertNoCourseRoleOfUserExists($username)
    {
        /** @var CourseRole[] $allCourseRoles */
        $allCourseRoles = $this->entityManager->getRepository(CourseRole::class)->findAll();
        $courseRolesOfUser = array_filter($allCourseRoles, function (CourseRole $courseRole) use ($username) {
            return $courseRole->getUser()->getUsername() === $username;
        });

        assertEquals(0, count($courseRolesOfUser));
    }

    /**
     * @Then The User :username is anonymized and their unused content removed
     */
    public function assertUserIsAnonymizedAndUnusedContentIsRemoved($username)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        /**
         * Why
         *   We check the User's username to verify that the user is correctly anonymized
         */
        assertNotEquals($username, $user->getUsername(), "Username should be anonymized.");

        // attachment
        $attachmentByUser = $this->entityManager->getRepository(Attachment::class)->findBy(['creator' => $user]);
        $attachmentNotCorrectlyRemoved = array_filter($attachmentByUser, function (Attachment $attachment) use ($username) {
            // attachment is not used in unpublished Exercise
            $notUnpublished = $attachment->getExercisePhase()->getBelongsToExercise()->getStatus() !== Exercise::EXERCISE_CREATED;
            // attachment user is not $username
            $usernameIsAnonymized = $attachment->getCreator()->getUsername() !== $username;

            return !($notUnpublished || $usernameIsAnonymized);
        });

        assertEquals(0, count($attachmentNotCorrectlyRemoved), "Unused Attachment should be removed.");

        // videos
        $videos = $this->videoService->getVideosCreatedByUserWithoutFilters($user);
        $videosNotCorrectlyRemoved = array_filter($videos, function (Video $video) use ($username) {
            // video is not _only_ used in unpublished Exercise
            // If it is used in just a single published Exercise it has to persist
            $notAllExercisesUnpublished = !$video->getExercisePhases()
                ->forAll(fn ($_i, Exercise $exercise) => $exercise->getStatus() === Exercise::EXERCISE_CREATED);

            $creatorAnonymized = $video->getCreator()->getUsername() !== $username;

            return !($notAllExercisesUnpublished || $creatorAnonymized);
        });

        assertEquals(0, count($videosNotCorrectlyRemoved), "Unused Videos should be removed.");

        // courseRoles
        $courseRolesWithUser = $this->entityManager->getRepository(CourseRole::class)->findBy(['user' => $user]);
        assertEquals(0, count($courseRolesWithUser), "User should not have CourseRoles.");
        assertEquals(0, $user->getCourseRoles()->count(), "User should not have CourseRoles.");

        // exercises (unpublished)
        $exercises = $this->exerciseService->getExercisesCreatedByUserWithoutFilters($user);
        $exercisesNotUnpublishedAndAnonymized =
            count(
                array_filter($exercises, function (Exercise $exercise) use ($username) {
                    $published = $exercise->getStatus() !== Exercise::EXERCISE_CREATED;
                    $usernameAnonymized = $exercise->getCreator()->getUsername() !== $username;

                    return !($published || $usernameAnonymized);
                })
            ) === 0;

        assertEquals(true, $exercisesNotUnpublishedAndAnonymized, "No unpublished Exercises should remain.");

        // teams
        $teams = $this->entityManager->getRepository(ExercisePhaseTeam::class)->findAll();
        $teamsWithUser = array_filter($teams, function (ExercisePhaseTeam $team) use ($user, $username) {
            $userIsCreator = $team->getCreator() === $user;
            $userIsMember = $team->getMembers()->contains($user);

            return $userIsCreator || $userIsMember;
        });

        assertEquals(0, count($teamsWithUser), "User should not be in any ExercisePhaseTeam.");
    }
}
