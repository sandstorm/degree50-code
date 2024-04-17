<?php

namespace App\Domain;

use App\Domain\Fachbereich;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Fachbereich|null find($id, $lockMode = null, $lockVersion = null)
 * @method Fachbereich|null findOneBy(array $criteria, ?array $orderBy = null)
 * @method Fachbereich[] findAll()
 * @method Fachbereich[] findBy(array $criteria, ?array $orderBy = null, $limit = null, $offset = null)
 */
class FachbereichRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Fachbereich::class);
    }
}
