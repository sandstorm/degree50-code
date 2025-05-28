<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\Exercise\Model\Exercise;
use App\Domain\Exercise\Service\ExerciseService;
use App\Domain\User\Model\User;

class GroupedExercisesBuilder
{
    private array $ownExercises = [];
    private array $otherExercises = [];

    public function __construct(
        private readonly ExerciseService $exerciseService
    )
    {
    }

    public function addOwnExercise(Exercise $exercise, User $user): static
    {
        $this->ownExercises[] = new ExerciseWithReviewStatusAndCompletedPhasesDTO(
            $exercise,
            $this->exerciseService->needsReview($exercise),
            $this->exerciseService->getCompletedPhasesCountForUser($user, $exercise),
        );

        return $this;
    }

    public function addOtherExercise(Exercise $exercise, User $user): static
    {
        $this->otherExercises[] = new ExerciseWithReviewStatusAndCompletedPhasesDTO(
            $exercise,
            $this->exerciseService->needsReview($exercise),
            $this->exerciseService->getCompletedPhasesCountForUser($user, $exercise),
        );

        return $this;
    }

    public function create(): array
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
