<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\ExercisePhase;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ExercisePhase|null find($id, $lockMode = null, $lockVersion = null)
 * @method ExercisePhase|null findOneBy(array $criteria, array $orderBy = null)
 * @method ExercisePhase[]    findAll()
 * @method ExercisePhase[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExercisePhaseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExercisePhase::class);
    }
}
