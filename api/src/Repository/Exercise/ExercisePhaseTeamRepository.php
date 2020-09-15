<?php

namespace App\Repository\Exercise;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
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
     * @param ExercisePhase $exercisePhase
     * @return ExercisePhaseTeam|null
     */
    public function findByMember(User $member, ExercisePhase $exercisePhase)
    {
        return $this->createQueryBuilder('e')
            ->andWhere(':member MEMBER OF e.members')
            ->andWhere('e.exercisePhase = :exercisePhase')
            ->setParameter('member', $member)
            ->setParameter('exercisePhase', $exercisePhase)
            ->orderBy('e.id', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    /**
     * @param User $creator
     * @param User $exerciseCreator
     * @param ExercisePhase $exercisePhase
     * @return ExercisePhaseTeam[]|\iterable
     */
    public function findAllCreatedByOtherUsers(User $creator, User $exerciseCreator, ExercisePhase $exercisePhase): iterable
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.creator != :creator')
            ->andWhere('e.creator != :exerciseCreator')
            ->andWhere('e.exercisePhase = :exercisePhase')
            ->setParameter('creator', $creator)
            ->setParameter('exerciseCreator', $exerciseCreator)
            ->setParameter('exercisePhase', $exercisePhase)
            ->orderBy('e.id', 'ASC')
            ->getQuery()
            ->getResult()
            ;
    }
}
