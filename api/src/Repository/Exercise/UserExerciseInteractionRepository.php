<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\UserExerciseInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method UserExerciseInteraction|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserExerciseInteraction|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserExerciseInteraction[]    findAll()
 * @method UserExerciseInteraction[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserExerciseInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserExerciseInteraction::class);
    }

    // /**
    //  * @return UserExerciseInteraction[] Returns an array of UserExerciseInteraction objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('u.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?UserExerciseInteraction
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
