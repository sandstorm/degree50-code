<?php

namespace App\Exercise\Controller\Dto;

use App\Entity\Exercise\Exercise;

/**
 * Dto which contains an exercise as well as its review status.
 */
class ExerciseWithReviewStatusDTO
{
    private Exercise $exercise;
    private bool $needsReview;

    public static function create(Exercise $exercise, bool $needsReview)
    {
        return new self($exercise, $needsReview);
    }

    private function __construct(Exercise $exercise, bool $needsReview)
    {
        $this->exercise = $exercise;
        $this->needsReview = $needsReview;
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
