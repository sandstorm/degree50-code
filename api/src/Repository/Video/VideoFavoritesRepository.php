<?php

namespace App\Repository\Video;

use App\Entity\Account\User;
use App\Entity\Video\Video;
use App\Entity\Video\VideoFavorite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Psr\Log\LoggerInterface;

/**
 * @method VideoFavorite|null find($id, $lockMode = null, $lockVersion = null)
 * @method VideoFavorite|null findOneBy(array $criteria, array $orderBy = null)
 * @method VideoFavorite[]    findAll()
 * @method VideoFavorite[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VideoFavoritesRepository extends ServiceEntityRepository
{
    private LoggerInterface $logger;

    public function __construct(
        ManagerRegistry $registry,
        LoggerInterface $logger
    ) {
        parent::__construct($registry, VideoFavorite::class);
        $this->logger = $logger;
    }

    public function findByUser(User $user)
    {
        return $this->createQueryBuilder('videoFavorite')
            ->andWhere('videoFavorite.user = :user')
            ->setParameter('user', $user)
            ->orderBy('videoFavorite.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByUserAndVideo(User $user, Video $video)
    {
        return $this->createQueryBuilder('videoFavorite')
            ->andWhere('videoFavorite.user = :user')
            ->setParameter('user', $user)
            ->andWhere('videoFavorite.video = :video')
            ->setParameter('video', $video)
            ->orderBy('videoFavorite.id', 'ASC')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function removeAllWithVideo(Video $video): void
    {
        $this->createQueryBuilder('videoFavorite')
            ->delete()
            ->where('videoFavorite.video = :video')
            ->setParameter('video', $video)
            ->getQuery()
            ->execute();
    }
}
