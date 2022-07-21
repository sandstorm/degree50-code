<?php


namespace App\Admin\Controller;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ExerciseService;
use App\Mediathek\Service\VideoFavouritesService;
use App\Mediathek\Service\VideoService;
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

    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;
    private VideoService $videoService;
    private ExerciseService $exerciseService;
    private VideoFavouritesService $videoFavoritesService;
    private Security $security;

    public function __construct(
        Security $security,
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        VideoService $videoService,
        ExerciseService $exerciseService,
        VideoFavouritesService $videoFavoritesService,
    ) {
        $this->security = $security;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->videoService = $videoService;
        $this->exerciseService = $exerciseService;
        $this->videoFavoritesService = $videoFavoritesService;
    }

    public function getLoggendInUser(): User
    {
        // Type mismatch is ok
        return $this->security->getUser();
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
        if ($user->isDozent()) {
            $this->anonymizeDozent($user);
        } else {
            $this->deleteStudentOrAdmin($user);
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
         * @see User::getUsername()
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

        // remove unused educational content
        $this->removeFromExerciseTeams($user);
        $this->removeUnpublishedExercisesOfUser($user);
        $this->removeUnUsedVideosOfUser($user);

        /**
         * Why
         *   Removal of CourseRoles is cascaded when removing a User but here we do _not_ remove the user.
         */
        $user->getCourseRoles()->map(fn (CourseRole $courseRole) => $this->entityManager->remove($courseRole));

        $this->eventStore->addEvent('UserDeleted', [
            'userId' => $user->getId(),
            'method' => 'anonymized',
        ]);

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    private function deleteStudentOrAdmin(User $user): void
    {
        // remove created Exercises, Videos and Interactions
        $this->videoService->deleteVideosCreatedByUser($user);
        $this->exerciseService->deleteExercisesCreatedByUser($user);
        $this->videoFavoritesService->deleteFavoriteVideosByUser($user);
        $this->removeFromExerciseTeams($user);

        $this->eventStore->addEvent('UserDeleted', [
            'userId' => $user->getId(),
            "method" => 'deleted',
        ]);

        /**
         * Due to ORM cascading options the following things will also happen when we delete a user:
         *
         *   1. All orphaned CourseRoles will be removed @see User::$courseRoles
         *   2. All orphaned UserExerciseInteractions will be removed @see User::$userExerciseInteractions
         */
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }

    /**
     * Why
     *   Remove User from ExercisePhaseTeams and remove their AutosavedSolutions.
     *   If the user is the only member remove the ExercisePhaseTeam which cascades
     *   down to Solutions and AutosavedSolutions.
     */
    private function removeFromExerciseTeams(User $user): void
    {
        $teamRepository = $this->entityManager->getRepository(ExercisePhaseTeam::class);
        $teamsOfUser = array_filter($teamRepository->findAll(), function (ExercisePhaseTeam $team) use ($user) {
            return $team->getMembers()->contains($user);
        });

        foreach ($teamsOfUser as $team) {
            /** @var ExercisePhaseTeam $team */
            if ($team->getMembers()->count() > 1) {
                $team->removeMember($user);
                $team->getAutosavedSolutions()->filter(function (AutosavedSolution $autosavedSolution) use ($user) {
                    return $autosavedSolution->getOwner() === $user;
                })->forAll(fn ($_i, AutosavedSolution $autosavedSolution) => $this->entityManager->remove($autosavedSolution));
                $this->entityManager->persist($team);

                $this->eventStore->addEvent('MemberRemovedFromTeam', [
                    "exercisePhaseTeamId" => $team->getId(),
                    "userId" => $user->getId(),
                    "exercisePhaseId" => $team->getExercisePhase()->getId(),
                ]);
            } else {
                $this->eventStore->addEvent('TeamDeleted', [
                    "exercisePhaseTeamId" => $team->getId(),
                    "userId" => $user->getId(),
                    "exercisePhaseId" => $team->getExercisePhase()->getId(),
                ]);
                $this->entityManager->remove($team);
            }

            $this->entityManager->flush();
        }
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
}
