<?php

namespace App\Repository\Video;

use App\Entity\Video\VideoCode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method VideoCode|null find($id, $lockMode = null, $lockVersion = null)
 * @method VideoCode|null findOneBy(array $criteria, array $orderBy = null)
 * @method VideoCode[]    findAll()
 * @method VideoCode[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VideoCodeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VideoCode::class);
    }

    // /**
    //  * @return VideoCode[] Returns an array of VideoCode objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('v.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?VideoCode
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
