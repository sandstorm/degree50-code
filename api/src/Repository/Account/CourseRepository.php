<?php

namespace App\Repository\Account;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Course|null find($id, $lockMode = null, $lockVersion = null)
 * @method Course|null findOneBy(array $criteria, array $orderBy = null)
 * @method Course[]    findAll()
 * @method Course[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CourseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Course::class);
    }

    /**
     * @param $user User
     * @return Course[] Returns an array of Course objects
     */
    public function findAllByUser($user)
    {
        return $this->createQueryBuilder('c')
            ->innerJoin('c.courseRoles', 'cr', 'WITH', 'cr.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult()
        ;
    }
}
