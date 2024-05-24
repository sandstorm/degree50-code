<?php

namespace App\Domain\Exercise\Dto;

readonly class PhaseMetadata
{
    public function __construct(
        private bool   $needsReview,
        private bool   $isDone,
        private string $phaseTitle,
        private string $iconClass
    )
    {
    }

    public function toArray(): array
    {
        return [
            'needsReview' => $this->needsReview,
            'isDone' => $this->isDone,
            'phaseTitle' => $this->phaseTitle,
            'iconClass' => $this->iconClass
        ];
    }
}
