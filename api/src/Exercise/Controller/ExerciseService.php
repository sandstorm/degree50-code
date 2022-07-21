<?php


namespace App\Exercise\Controller;

use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseStatus;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExerciseStatus;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Account\CourseRoleRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\ExerciseRepository;
use Doctrine\ORM\EntityManagerInterface;

class ExerciseService
{
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;
    private ExerciseRepository $exerciseRepository;
    private ExercisePhaseService $exercisePhaseService;

    const EXERCISE_DOCTRINE_FILTER_NAME = 'exercise_doctrine_filter';

    public function __construct(
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        ExerciseRepository $exerciseRepository,
        ExercisePhaseService $exercisePhaseService,
    )
    {
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->exerciseRepository = $exerciseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
    }

    /**
     * @param User $user
     * @return Exercise[]
     */
    public function getExercisesCreatedByUserWithoutFilters(User $user): array
    {
        $this->entityManager->getFilters()->disable(self::EXERCISE_DOCTRINE_FILTER_NAME);
        $exercises = $this->exerciseRepository->findBy(['creator' => $user]);
        $this->entityManager->getFilters()->enable(self::EXERCISE_DOCTRINE_FILTER_NAME);

        return $exercises;
    }

    /**
     * @param User $user
     * @return Exercise[]
     */
    public function getExercisesForUser(User $user): array
    {
        /** @var Exercise[] $result */
        $result = [];

        foreach ($user->getCourseRoles()->getValues() as $courseRole) {
            $result = [...$result, ...$courseRole->getCourse()->getExercises()];
        };

        $visibleExercises = array_filter($result, fn(Exercise $exercise) => $exercise->getStatus() !== 0);

        return $visibleExercises;
    }

    public function deleteExercisesCreatedByUser(User $user): void
    {
        $exercises = $this->getExercisesCreatedByUserWithoutFilters($user);

        foreach ($exercises as $exercise) {
            $this->deleteExercise($exercise);
        }
    }

    /*
     * The "needsReview" status is derived from all phases and their teams.
     * So if there is at least one phase that has the "reviewRequired" flag set to true and
     * where the ExercisePhaseStatus of the team is "IN_REVIEW" the "needsReview" status of this Dto
     * will be set to true.
     */
    public function needsReview(Exercise $exercise): bool
    {
        return $exercise->getPhases()->exists(
            fn($_key, ExercisePhase $exercisePhase) => $exercisePhase->getTeams()->exists(fn($_key, ExercisePhaseTeam $team) => $this->exercisePhaseService->getStatusForTeam($team) === ExercisePhaseStatus::IN_REVIEW)
        );
    }

    public function getExerciseStatusForUser(Exercise $exercise, User $user): ExerciseStatus
    {
        $exercisePhases = $exercise->getPhases();
        $teams = $exercise->getPhases()->map(
            fn(ExercisePhase $phase) => $phase->getTeams()->filter(
                fn(ExercisePhaseTeam $team) => $team->getMembers()->contains($user)
            )->first()
        // Why "mixed": Collection filter returns false if collection is empty o.O
        )->filter(fn(mixed $team) => $team instanceof ExercisePhaseTeam);

        // no phase started yet
        if ($teams->isEmpty()) {
            return ExerciseStatus::NEU;
        }

        if (
            // at least one phase not started yet
            $teams->count() < $exercisePhases->count()
            // at least one phase in BEARBEITUNG
            || $teams->exists(fn($_key, ExercisePhaseTeam $team) => $team->getStatus() === ExercisePhaseStatus::IN_BEARBEITUNG)
        ) {
            return ExerciseStatus::IN_BEARBEITUNG;
        }

        return ExerciseStatus::BEENDET;
    }

    public function deleteExercise(Exercise $exercise): void
    {
        $this->eventStore->addEvent('ExerciseDeleted', [
            'exerciseId' => $exercise->getId(),
            'courseId' => $exercise->getCourse()->getId(),
        ]);

        /**
         * Due to ORM cascading options the following things will also happen when we delete an Exercise:
         *
         *   1. All attached ExercisePhases will be removed @see Exercise::$phases
         *   2. All attached UserExerciseInteractions will be removed @see Exercise::$userExerciseInteractions
         *
         * TODO: There will be no Events triggered like "ExercisePhaseDeleted" or "AttachmentDeleted" (cascaded removal when
         *       deleting an ExercisePhase).
         */
        $this->entityManager->remove($exercise);
        $this->entityManager->flush();
    }
}
