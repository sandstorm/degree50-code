<?php

namespace App\Domain\User\Service;

use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Security;

/**
 * This Service handles the removal of Users from the system.
 *
 * In case of User being a Dozent we will keep their created Exercises and
 * Videos needed for those Exercises. The Dozent will be anonymized and all his rights will be removed.
 *
 * In case of User being a Student|Admin we will remove everything the User created.
 *
 * Events will not be removed as, at the time of writing, they do not seem to include any sensitive data.
 */
class UserService
{
    public function __construct(
        private readonly Security                     $security,
        private readonly EntityManagerInterface       $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly VideoService                 $videoService,
        private readonly ExerciseService              $exerciseService,
        private readonly VideoFavouritesService       $videoFavoritesService,
        private readonly UserMaterialService          $userMaterialService,
    )
    {
    }

    public function getLoggendInUser(): User|null
    {
        /** @var User */
        return $this->security->getUser();
    }

    public function deleteStudent(User $user): void
    {
        if ($user->isAdmin() || $user->isDozent()) {
            throw new \InvalidArgumentException('User is not a Student');
        }

        $this->exerciseService->deleteExercisesCreatedByUser($user);
        $this->videoFavoritesService->deleteFavoriteVideosByUser($user);
        $this->userMaterialService->deleteMaterialsOfUser($user);
        $this->videoService->deleteVideosCreatedByUser($user);

        // remove user from teams
        $teamsWhereUserCanNotBeRemoved = $this->removeFromExerciseTeams($user);

        if (count($teamsWhereUserCanNotBeRemoved) === 0) {
            $this->eventStore->addEvent('UserDeleted', [
                'userId' => $user->getId(),
                "method" => 'deleted',
            ]);

            /**
             * Due to ORM cascading options the following things will also happen when we delete a user:
             *
             *   1. All orphaned CourseRoles will be removed @see \App\Domain\User\\Model\User::$courseRoles
             *   // TODO: UserExerciseInteractions are not part of the model anymore?
             *   2. All orphaned UserExerciseInteractions will be removed @see \App\Domain\User\\Model\User::$userExerciseInteractions
             */
            $this->entityManager->remove($user);
            $this->entityManager->flush();
        } else {
            // anonymize user
            $user->setEmail(Uuid::uuid4()->toString());
            $user->setPassword(md5(random_bytes(20)));
            $user->setRoles([]);
            $user->setDataPrivacyVersion(-1);
            $user->setTermsOfUseVersion(-1);

            // set expiration date to 1 year from now
            $user->setExpirationDate(new \DateTimeImmutable('+1 year'));
            // prevent emails from being sent to user due to expiration
            $user->setExpirationNoticeSent(true);

            // set expiration date to 1 year from now
            $this->eventStore->addEvent('UserDeleted', [
                'userId' => $user->getId(),
                "method" => 'anonymized',
            ]);

            $this->entityManager->persist($user);
            $this->entityManager->flush();
        }
    }

    public function removeUser(User $user): void
    {
        // only Admins can remove Users
        /** @var User $currentlyLoggedInUser */
        $currentlyLoggedInUser = $this->security->getUser();
        if (!$currentlyLoggedInUser->isAdmin()) {
            throw new AccessDeniedException();
        }

        /**
         * Why
         *   We do not remove Dozent like a Student or Admin because we want to keep their
         *   created educational content (used exercises, used videos, used attachments).
         *   Dozent will be anonymized and the Account made practically unusable.
         */
        switch (true) {
            case $user->isAdmin():
                $this->deleteAdmin($user);
                break;
            case $user->isDozent():
                $this->anonymizeDozent($user);
                break;
            case $user->isStudent():
                $this->deleteStudent($user);
                break;
            default:
                throw new \InvalidArgumentException('User is not a Student, Dozent or Admin');
        }
    }

    /**
     * This will cause a User (Dozent) to be practically unusable and anonymous.
     */
    private function anonymizeDozent(User $user): void
    {
        /**
         * WHY overwrite the email:
         *     Email acts as the username in this system.
         * @see \App\Domain\User\\Model\User::getUsername()
         */
        $user->setEmail(Uuid::uuid4()->toString());

        /**
         * WHY `md5(random_bytes((length))`:
         * @see https://symfony.com/doc/current/components/security/secure_tools.html#generating-a-secure-random-string
         *
         * TODO: handle Exception?
         *       random_bytes() throws if it can not gather enough entropy - which is rather unlikely
         */
        $user->setPassword(md5(random_bytes(20)));

        // remove roles
        $user->setRoles([]);

        // remove any other meta data that could be used to narrow down or identify the user
        $user->setDataPrivacyVersion(-1);
        $user->setTermsOfUseVersion(-1);

        // set expiration date to 1 year from now
        $user->setExpirationDate(new \DateTimeImmutable('+1 year'));
        // prevent emails from being sent to user due to expiration
        $user->setExpirationNoticeSent(true);

        // remove unused educational content
        $teamsWhereUserIsOnlyMember = $this->removeFromExerciseTeams($user);

        foreach ($teamsWhereUserIsOnlyMember as $team) {
            $this->entityManager->remove($team);
        }

        $this->removeUnpublishedExercisesOfUser($user);
        $this->removeUnUsedVideosOfUser($user);

        /**
         * Why
         *   Removal of CourseRoles is cascaded when removing a User but here we do _not_ remove the user.
         */
        $user->getCourseRoles()->map(fn(CourseRole $courseRole) => $this->entityManager->remove($courseRole));

        $this->eventStore->addEvent('UserDeleted', [
            'userId' => $user->getId(),
            'method' => 'anonymized',
        ]);

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    private function deleteAdmin(User $user): void
    {
        // remove created Exercises, Videos and Interactions
        $this->videoService->deleteVideosCreatedByUser($user);
        $this->exerciseService->deleteExercisesCreatedByUser($user);
        $this->videoFavoritesService->deleteFavoriteVideosByUser($user);
        $this->userMaterialService->deleteMaterialsOfUser($user);
        $teamsWhereUserIsOnlyMember = $this->removeFromExerciseTeams($user);

        foreach ($teamsWhereUserIsOnlyMember as $team) {
            $this->entityManager->remove($team);
        }

        $this->eventStore->addEvent('UserDeleted', [
            'userId' => $user->getId(),
            "method" => 'deleted',
        ]);

        /**
         * Due to ORM cascading options the following things will also happen when we delete a user:
         *
         *   1. All orphaned CourseRoles will be removed @see \App\Domain\User\\Model\User::$courseRoles
         *   2. All orphaned UserExerciseInteractions will be removed @see \App\Domain\User\\Model\User::$userExerciseInteractions
         */
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }

    /**
     * Why
     *   Remove User from ExercisePhaseTeams and remove their AutosavedSolutions.
     *   If the user is the only member then only remove AutosavedSolutions.
     *
     * @return ExercisePhaseTeam[] Teams the User could not be removed from
     */
    private function removeFromExerciseTeams(User $user): array
    {
        /* @var ExercisePhaseTeamRepository $teamRepository */
        $teamRepository = $this->entityManager->getRepository(ExercisePhaseTeam::class);
        $teamsOfUser = array_filter($teamRepository->findAll(), function (ExercisePhaseTeam $team) use ($user) {
            return $team->getMembers()->contains($user);
        });

        $teamsNotRemoved = [];

        foreach ($teamsOfUser as $team) {
            /** @var ExercisePhaseTeam $team */
            $team->getAutosavedSolutions()
                ->filter(function (AutosavedSolution $autosavedSolution) use ($user) {
                    return $autosavedSolution->getOwner() === $user;
                })
                ->forAll(fn($_i, AutosavedSolution $autosavedSolution) => $this->entityManager->remove($autosavedSolution));
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();

            if ($team->getMembers()->count() > 1) {
                $team->removeMember($user);

                $this->eventStore->addEvent('MemberRemovedFromTeam', [
                    "exercisePhaseTeamId" => $team->getId(),
                    "userId" => $user->getId(),
                    "exercisePhaseId" => $team->getExercisePhase()->getId(),
                ]);

                $this->entityManager->persist($team);
                $this->entityManager->flush();
            } elseif ($team->isTest()) {
                $this->eventStore->addEvent('TeamDeleted', [
                    "exercisePhaseTeamId" => $team->getId(),
                    "userId" => $user->getId(),
                    "exercisePhaseId" => $team->getExercisePhase()->getId(),
                ]);
                $this->entityManager->remove($team);
                $this->entityManager->flush();
            } else {
                $teamsNotRemoved[] = $team;
            }
        }

        return $teamsNotRemoved;
    }

    private function removeUnpublishedExercisesOfUser(User $user): void
    {
        $exercisesOfUser = $this->exerciseService->getExercisesCreatedByUserWithoutFilters($user);
        $unpublishedExercisesOfUser = array_filter($exercisesOfUser, function ($exercise) {
            return $exercise->getStatus() === Exercise::EXERCISE_CREATED;
        });

        foreach ($unpublishedExercisesOfUser as $exercise) {
            $this->exerciseService->deleteExercise($exercise);
        }
    }

    private function removeUnUsedVideosOfUser(User $user): void
    {
        $videosOfUser = $this->videoService->getVideosCreatedByUserWithoutFilters($user);
        $unUsedVideosOfUser = array_filter($videosOfUser, function ($video) {
            return $video->getExercisePhases()->count() === 0 && $video->getCourses()->count() === 0;
        });

        foreach ($unUsedVideosOfUser as $video) {
            $this->videoService->deleteVideo($video);
        }
    }

    public function userCanUploadVideo(): bool
    {
        /** @var User $user */
        $user = $this->security->getUser();
        return $this->canUploadVideo($user);
    }

    public function canUploadVideo(User $user): bool
    {
        if ($user->isAdmin() || $user->isDozent()) {
            return true;
        }

        // check if student is assigned to a course
        $userCourses = $user->getCourseRoles()->map(function (CourseRole $courseRole) {
            return $courseRole->getCourse();
        });

        return $userCourses->count() > 0;
    }
}
