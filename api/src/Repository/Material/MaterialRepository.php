<?php

namespace App\Repository\Material;

use App\Entity\Account\User;
use App\Entity\Material\Material;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Psr\Log\LoggerInterface;

/**
 * @method Material|null find($id, $lockMode = null, $lockVersion = null)
 * @method Material|null findOneBy(array $criteria, array $orderBy = null)
 * @method Material[]    findAll()
 * @method Material[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MaterialRepository extends ServiceEntityRepository
{
    private LoggerInterface $logger;

    public function __construct(
        ManagerRegistry $registry,
        LoggerInterface $logger
    ) {
        parent::__construct($registry, Material::class);
        $this->logger = $logger;
    }

    public function findByOwner(User $user)
    {
        return $this->createQueryBuilder('material')
            ->andWhere('material.owner = :user')
            ->setParameter('user', $user)
            ->orderBy('material.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
