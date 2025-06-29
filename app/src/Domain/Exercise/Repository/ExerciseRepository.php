<?php

namespace App\Domain\Exercise\Repository;

use App\Domain\Course\Repository\CourseRepository;
use App\Domain\Exercise\Model\Exercise;
use App\Domain\User\Model\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Exercise|null find($id, $lockMode = null, $lockVersion = null)
 * @method Exercise|null findOneBy(array $criteria, array $orderBy = null)
 * @method Exercise[]    findAll()
 * @method Exercise[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExerciseRepository extends ServiceEntityRepository
{

    public function __construct(
        ManagerRegistry $registry,
        private readonly CourseRepository $courseRepository
    )
    {
        parent::__construct($registry, Exercise::class);
    }

    /**
     * @return Exercise[]
     */
    public function findAllForUserWithCriteria(User $user, Criteria $criteria = null): array
    {
        $criteria = $criteria ?? Criteria::create();

        $qb = $this
            ->createQueryBuilder('exercise')
            ->addCriteria($criteria);

        if (!$user->isAdmin()) {
            $userCourses = $user->getCourses();
            $tutorialCourses = $this->courseRepository->findAllForUserWithCriteria($user);

            $qb
                ->andWhere('exercise.course IN (:userCourses) OR exercise.course IN (:tutorialCourses)')
                ->setParameter('userCourses', $userCourses)
                ->setParameter('tutorialCourses', $tutorialCourses);
        }

        return $qb
            ->getQuery()
            ->getResult();
    }
}
