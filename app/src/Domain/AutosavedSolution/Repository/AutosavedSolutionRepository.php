<?php

namespace App\AutosavedSolution\Repository;

use App\Domain\Exercise\AutosavedSolution;
use App\Domain\Exercise\ExercisePhaseTeam;
use App\Domain\Exercise\Solution;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method AutosavedSolution|null find($id, $lockMode = null, $lockVersion = null)
 * @method AutosavedSolution|null findOneBy(array $criteria, array $orderBy = null)
 * @method AutosavedSolution[]    findAll()
 * @method AutosavedSolution[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AutosavedSolutionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AutosavedSolution::class);
    }

    public function getLatestSolutionOfExerciseTeam(ExercisePhaseTeam $exercisePhaseTeam): Solution|AutosavedSolution|null
    {
        $latestAutosavedSolution = $this->findOneBy(['team' => $exercisePhaseTeam], ['update_timestamp' => 'desc']);

        $solution = $exercisePhaseTeam->getSolution();
        $latestSolutionUpdate = $solution->getUpdateTimestamp();

        if ($latestAutosavedSolution && $latestAutosavedSolution->getUpdateTimestamp() > $latestSolutionUpdate) {
            return $latestAutosavedSolution;
        }

        return $solution;
    }
}
