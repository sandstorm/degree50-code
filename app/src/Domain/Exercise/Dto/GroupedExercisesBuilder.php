<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Exercise\Controller\ExerciseService;

class GroupedExercisesBuilder
{

    private array $ownExercises = [];
    private array $otherExercises = [];

    function __construct(
        private readonly ExerciseService $exerciseService
    )
    {
    }

    public function addOwnExercise($exercise)
    {
        array_push(
            $this->ownExercises,
            ExerciseWithReviewStatusDTO::create($exercise, $this->exerciseService->needsReview($exercise))
        );

        return $this;
    }

    public function addOtherExercise($exercise)
    {
        array_push(
            $this->otherExercises,
            ExerciseWithReviewStatusDto::create($exercise, $this->exerciseService->needsReview($exercise))
        );

        return $this;
    }

    public function create()
    {
        return [
            [
                'id' => 'ownExercises',
                'exercises' => $this->ownExercises
            ],
            [
                'id' => 'otherExercises',
                'exercises' => $this->otherExercises
            ]
        ];
    }
}
