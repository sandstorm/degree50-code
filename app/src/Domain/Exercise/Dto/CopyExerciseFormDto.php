<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Account\Course;
use App\Domain\Exercise\Exercise;

class CopyExerciseFormDto
{
    private Course $course;

    private bool $copyPhases;

    private function __construct(Course $course, bool $copyPhases)
    {
        $this->course = $course;
        $this->copyPhases = $copyPhases;
    }

    public static function fromExercise(Exercise $exercise): CopyExerciseFormDto
    {
        return new self($exercise->getCourse(), true);
    }

    /**
     * @return Course
     */
    public function getCourse(): Course
    {
        return $this->course;
    }

    /**
     * @param Course $course
     */
    public function setCourse(Course $course): void
    {
        $this->course = $course;
    }

    /**
     * @return bool
     */
    public function getCopyPhases(): bool
    {
        return $this->copyPhases;
    }

    /**
     * @param bool $copyPhases
     */
    public function setCopyPhases(bool $copyPhases): void
    {
        $this->copyPhases = $copyPhases;
    }


}
