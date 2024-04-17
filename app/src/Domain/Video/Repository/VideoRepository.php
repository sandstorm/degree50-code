<?php

namespace App\Repository\Video;

use App\Domain\Account\Course;
use App\Domain\Account\User;
use App\Domain\Video\Video;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Join;
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

    public function findByCreatorWithoutCutVideos(User $user)
    {
        $qb = $this->createQueryBuilder('v');

        // We only want to show videos which where manually uploaded, and not
        // cut videos. Therefore we left join with the solutions table
        // and check if the video is actually a cut video on the solution and if so, filter it out.
        return $qb
            ->leftJoin(
                'App\Domain\Exercise\Solution',
                'solution',
                Join::WITH,
                'v.id = solution.cutVideo'
            )
            ->where('v.creator = :user')
            ->andWhere('solution.cutVideo IS NULL')
            ->setParameter('user', $user)
            ->orderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @param Course $course
     * @return Video[]|iterable
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
