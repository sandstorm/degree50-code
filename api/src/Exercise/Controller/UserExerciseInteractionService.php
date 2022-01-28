<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\UserExerciseInteraction;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\Persistence\ManagerRegistry;
use Psr\Log\LoggerInterface;

class UserExerciseInteractionService {
    private ManagerRegistry $managerRegistry;
    private DoctrineIntegratedEventStore $eventStore;
    private LoggerInterface $logger;

    function __construct(
        LoggerInterface $logger,
        DoctrineIntegratedEventStore $eventStore,
        ManagerRegistry $managerRegistry
    )
    {
        $this->logger = $logger;
        $this->eventStore = $eventStore;
        $this->managerRegistry = $managerRegistry;
    }

    public function setUserOpenedExercise(User $user, Exercise $exercise) {
        $userExerciseInteraction = new UserExerciseInteraction();
        $userExerciseInteraction->setExercise($exercise);
        $userExerciseInteraction->setUser($user);
        $userExerciseInteraction->setOpened(true);

        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager = $this->managerRegistry->getManager();
        $entityManager->persist($userExerciseInteraction);
        $entityManager->flush();
    }
}

