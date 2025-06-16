<?php

namespace App\Domain\Course\Service;

use App\Domain\Course\Model\Course;
use App\Domain\Exercise\Service\ExerciseService;
use Doctrine\ORM\EntityManagerInterface;

readonly class CourseService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ExerciseService        $exerciseService,
    )
    {
    }

    // reset Course (CourseRoles, Exercises, Phases, Teams, Solutions)
    public function resetCourse(Course $course): void
    {
        // reset Exercises
        foreach ($course->getExercises() as $exercise) {
            // remove exercises by students
            if ($exercise->getCreator()->isStudent()) {
                $this->exerciseService->deleteExercise($exercise);
            } else {
                // reset exercise phases, teams, solutions
                $this->exerciseService->resetExercise($exercise);
            }
        }

        // reset CourseRoles
        $this->removeAllStudentsFromCourse($course);

        $this->entityManager->persist($course);
        $this->entityManager->flush();
    }

    public function removeAllStudentsFromCourse(Course $course): void
    {
        foreach ($course->getCourseRoles() as $courseRole) {
            if ($courseRole->getUser()->isStudent()) {
                $course->getCourseRoles()->removeElement($courseRole);
                $this->entityManager->remove($courseRole);
            }
        }

        $this->entityManager->persist($course);
        $this->entityManager->flush();
    }

    public function removeCourse($course): void
    {
        $this->entityManager->remove($course);
        $this->entityManager->flush();
    }
}
