<?php

namespace App\Exercise\Controller;

use App\Entity\Exercise\ExercisePhaseTeam;
use App\Repository\Exercise\AutosavedSolutionRepository;
use Psr\Log\LoggerInterface;

class SolutionService {
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private LoggerInterface $logger;

    function __construct(AutosavedSolutionRepository $autosavedSolutionRepository, LoggerInterface $logger)
    {
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->logger = $logger;
    }

    // TODO
    // document me!!!!
    public function getSolutionFromExercisePhaseTeam(ExercisePhaseTeam $exercisePhaseTeam) {
        $solution = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);
        $solutionCreator = $exercisePhaseTeam->getCreator();

        $this->logger->info('POPEL: ' . $exercisePhaseTeam->getSolution()->getId());

        return [
            'solution' => $solution->getSolution(),
            'id' => $exercisePhaseTeam->getSolution()->getId(),
            'userName' => $solutionCreator->getEmail(),
            'userId' => $solutionCreator->getId(),
        ];
    }
}
