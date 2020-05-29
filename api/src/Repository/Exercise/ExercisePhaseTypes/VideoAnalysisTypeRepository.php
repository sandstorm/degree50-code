<?php

namespace App\Repository\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method VideoAnalysis|null find($id, $lockMode = null, $lockVersion = null)
 * @method VideoAnalysis|null findOneBy(array $criteria, array $orderBy = null)
 * @method VideoAnalysis[]    findAll()
 * @method VideoAnalysis[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VideoAnalysisTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VideoAnalysis::class);
    }

    // /**
    //  * @return VideoAnalysisType[] Returns an array of VideoAnalysisType objects
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
    public function findOneBySomeField($value): ?VideoAnalysisType
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
