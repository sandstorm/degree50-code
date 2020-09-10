<?php

namespace App\Repository\Video;

use App\Entity\Account\Course;
use App\Entity\Video\Video;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Video|null find($id, $lockMode = null, $lockVersion = null)
 * @method Video|null findOneBy(array $criteria, array $orderBy = null)
 * @method Video[]    findAll()
 * @method Video[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VideoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Video::class);
    }

    /**
     * @param Course $course
     * @return Video[]|\iterable
     */
    public function findByCourse(Course $course): iterable
    {
        return $this->createQueryBuilder('v')
            ->andWhere(':course MEMBER OF v.courses')
            ->setParameter('course', $course)
            ->orderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
