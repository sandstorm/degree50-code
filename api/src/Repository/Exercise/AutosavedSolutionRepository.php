<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\ExercisePhaseTeam;
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

    public function getLatestSolutionOfExerciseTeam(ExercisePhaseTeam $exercisePhaseTeam) {
        $latestAutosavedSolution = $this->findOneBy(['team' => $exercisePhaseTeam], ['update_timestamp' => 'desc']);
        $solution = $exercisePhaseTeam->getSolution()->getSolution();
        $latestSolutionUpdate = $exercisePhaseTeam->getSolution()->getUpdateTimestamp();

        if ($latestAutosavedSolution && $latestAutosavedSolution->getUpdateTimestamp() > $latestSolutionUpdate) {
            $solution = $latestAutosavedSolution->getSolution();
        }

        return $solution;
    }
}
