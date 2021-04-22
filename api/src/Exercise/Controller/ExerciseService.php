<?php


namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\ExerciseRepository;
use Doctrine\ORM\EntityManagerInterface;

class ExerciseService
{
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;
    private ExerciseRepository $exerciseRepository;

    const EXERCISE_DOCTRINE_FILTER_NAME = 'exercise_doctrine_filter';

    public function __construct(EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore, ExerciseRepository $exerciseRepository)
    {
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->exerciseRepository = $exerciseRepository;
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

    public function deleteExercisesCreatedByUser(User $user): void
    {
        $exercises = $this->getExercisesCreatedByUserWithoutFilters($user);

        foreach ($exercises as $exercise) {
            $this->deleteExercise($exercise);
        }
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
         * TODO: There will be no Events triggered like "ExercisePhaseDeleted" or "MaterialDeleted" (cascaded removal when
         *       deleting an ExercisePhase).
         */
        $this->entityManager->remove($exercise);
        $this->entityManager->flush();
    }
}
