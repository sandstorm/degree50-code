<?php

namespace App\Repository\Account;

use App\Entity\Account\CourseRole;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method CourseRole|null find($id, $lockMode = null, $lockVersion = null)
 * @method CourseRole|null findOneBy(array $criteria, array $orderBy = null)
 * @method CourseRole[]    findAll()
 * @method CourseRole[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CourseRoleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CourseRole::class);
    }

    // /**
    //  * @return CourseRole[] Returns an array of CourseRole objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?CourseRole
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
