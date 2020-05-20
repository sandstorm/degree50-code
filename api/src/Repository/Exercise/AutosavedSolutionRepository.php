<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\AutosavedSolution;
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

    // /**
    //  * @return AutosavedSolution[] Returns an array of AutosavedSolution objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('a.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?AutosavedSolution
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
