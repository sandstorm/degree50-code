<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Exercise\Model\Exercise;

/**
 * Dto which contains an exercise as well as its review status.
 */
readonly class ExerciseWithReviewStatusAndCompletedPhasesDTO
{
    public function __construct(
        public Exercise $exercise,
        public bool     $needsReview,
        public int      $completedPhases,
    )
    {
    }
}
