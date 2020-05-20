<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\ExercisePhaseTeam;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ExercisePhaseTeam|null find($id, $lockMode = null, $lockVersion = null)
 * @method ExercisePhaseTeam|null findOneBy(array $criteria, array $orderBy = null)
 * @method ExercisePhaseTeam[]    findAll()
 * @method ExercisePhaseTeam[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExercisePhaseTeamRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExercisePhaseTeam::class);
    }

    // /**
    //  * @return ExercisePhaseTeam[] Returns an array of ExercisePhaseTeam objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('e.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ExercisePhaseTeam
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
