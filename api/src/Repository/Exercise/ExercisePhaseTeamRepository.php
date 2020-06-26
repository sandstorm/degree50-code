<?php

namespace App\Repository\Exercise;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ExercisePhaseTeam|null find($id, $lockMode = null, $lockVersion = null)
 * @method ExercisePhaseTeam|null findOneBy(array $criteria, array $orderBy = null)
 * @method ExercisePhaseTeam[]    findAll()
 * @method ExercisePhaseTeam[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExercisePhaseTeamRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExercisePhaseTeam::class);
    }

    /**
     * @param User $member
     * @return ExercisePhaseTeam[]|\iterable
     */
    public function findByMember(User $member): iterable
    {
        return $this->createQueryBuilder('e')
            ->andWhere(':member MEMBER OF e.members')
            ->setParameter('member', $member)
            ->orderBy('e.id', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }
}
