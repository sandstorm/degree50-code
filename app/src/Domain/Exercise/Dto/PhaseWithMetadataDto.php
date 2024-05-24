<?php

namespace App\Domain\Exercise\Dto;

use App\Domain\ExercisePhase\Model\ExercisePhase;

readonly class PhaseWithMetadataDto
{
    public function __construct(
        private ExercisePhase $phase,
        private PhaseMetadata $metadata
    )
    {
    }

    public function toArray(): array
    {
        return [
            'phase' => $this->phase,
            'metadata' => $this->metadata->toArray()
        ];
    }
}
