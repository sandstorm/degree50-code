<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Course\Model\Course;
use App\Domain\Exercise\Model\Exercise;

readonly class CopyExerciseFormDto
{
    private function __construct(
        public Course $course,
        public bool   $copyPhases
    )
    {
    }

    public static function fromExercise(Exercise $exercise): CopyExerciseFormDto
    {
        return new self($exercise->getCourse(), true);
    }
}
