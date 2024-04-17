<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Exercise;

/**
 * Dto which contains an exercise as well as its review status.
 */
class ExerciseWithReviewStatusDTO
{
    private function __construct(
        private Exercise $exercise,
        private bool $needsReview
    )
    {
    }

    public static function create(Exercise $exercise, bool $needsReview)
    {
        return new self($exercise, $needsReview);
    }

    public function getExercise()
    {
        return $this->exercise;
    }

    public function getNeedsReview()
    {
        return $this->needsReview;
    }

    public function setNeedsReview($needsReview)
    {
        $this->needsReview = $needsReview;
    }
}
