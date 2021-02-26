<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\ExercisePhaseTeam;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Psr\Log\LoggerInterface;

/**
 * @method AutosavedSolution|null find($id, $lockMode = null, $lockVersion = null)
 * @method AutosavedSolution|null findOneBy(array $criteria, array $orderBy = null)
 * @method AutosavedSolution[]    findAll()
 * @method AutosavedSolution[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AutosavedSolutionRepository extends ServiceEntityRepository
{
    private LoggerInterface $logger;

    public function __construct(ManagerRegistry $registry, LoggerInterface $logger)
    {
        parent::__construct($registry, AutosavedSolution::class);
        $this->logger = $logger;
    }

    public function getLatestSolutionOfExerciseTeam(ExercisePhaseTeam $exercisePhaseTeam) {
        $latestAutosavedSolution = $this->findOneBy(['team' => $exercisePhaseTeam], ['update_timestamp' => 'desc']);

        $solution = $exercisePhaseTeam->getSolution();
        $latestSolutionUpdate = $solution->getUpdateTimestamp();

        if ($latestAutosavedSolution && $latestAutosavedSolution->getUpdateTimestamp() > $latestSolutionUpdate) {
            return $latestAutosavedSolution;
        }

        return $solution;
    }
}
