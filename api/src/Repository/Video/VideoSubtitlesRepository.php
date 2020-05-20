<?php

namespace App\Repository\Video;

use App\Entity\Video\VideoSubtitles;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method VideoSubtitles|null find($id, $lockMode = null, $lockVersion = null)
 * @method VideoSubtitles|null findOneBy(array $criteria, array $orderBy = null)
 * @method VideoSubtitles[]    findAll()
 * @method VideoSubtitles[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VideoSubtitlesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VideoSubtitles::class);
    }

    // /**
    //  * @return VideoSubtitles[] Returns an array of VideoSubtitles objects
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
    public function findOneBySomeField($value): ?VideoSubtitles
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
