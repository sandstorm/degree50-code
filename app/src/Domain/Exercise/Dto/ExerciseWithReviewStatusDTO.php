<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Exercise;

/**
 * Dto which contains an exercise as well as its review status.
 */
class ExerciseWithReviewStatusDTO
{
    private function __construct(
        private readonly Exercise $exercise,
        private bool $needsReview
    )
    {
    }

    public static function create(Exercise $exercise, bool $needsReview): ExerciseWithReviewStatusDTO
    {
        return new self($exercise, $needsReview);
    }

    public function getExercise(): Exercise
    {
        return $this->exercise;
    }

    public function getNeedsReview(): bool
    {
        return $this->needsReview;
    }

    public function setNeedsReview($needsReview): void
    {
        $this->needsReview = $needsReview;
    }
}
