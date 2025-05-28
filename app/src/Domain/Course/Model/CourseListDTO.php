<?php

namespace App\Domain\Course\Model;

readonly class CourseListDTO
{
    public function __construct(
        public Course $course,
        public int $completedExercisesCount,
        public int $totalExercisesCount,
        public ?\DateTimeImmutable $lastModifiedDate,
    ) {
    }
}
