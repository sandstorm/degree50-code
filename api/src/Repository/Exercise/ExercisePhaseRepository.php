<?php

namespace App\Repository\Exercise;

use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ExercisePhase|null find($id, $lockMode = null, $lockVersion = null)
 * @method ExercisePhase|null findOneBy(array $criteria, array $orderBy = null)
 * @method ExercisePhase[]    findAll()
 * @method ExercisePhase[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExercisePhaseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExercisePhase::class);
    }

    /**
     * @param int $sorting
     * @param Exercise $exercise
     * @return ExercisePhase|null
     */
    public function findExercisePhasesLargerThen($sorting, $exercise)
    {
        $em = $this->getEntityManager();
        $qb = $em->createQueryBuilder();

        return $this->createQueryBuilder('e')
            ->where('e.belongsToExercise = :exercise')
            ->andWhere(
                $qb->expr()->gt('e.sorting', $sorting)
            )
            ->orderBy('e.sorting', 'ASC')
            ->setMaxResults(1)
            ->setParameter('exercise', $exercise)
            ->getQuery()
            ->getOneOrNullResult();

    }

    /**
     * @param int $sorting
     * @param Exercise $exercise
     * @return ExercisePhase|null
     */
    public function findExercisePhasesLesserThen($sorting, $exercise)
    {
        $em = $this->getEntityManager();
        $qb = $em->createQueryBuilder();

        return $this->createQueryBuilder('e')
            ->where('e.belongsToExercise = :exercise')
            ->andWhere(
                $qb->expr()->lt('e.sorting', $sorting)
            )
            ->orderBy('e.sorting', 'DESC')
            ->setMaxResults(1)
            ->setParameter('exercise', $exercise)
            ->getQuery()
            ->getOneOrNullResult();

    }
}
