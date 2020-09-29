<?php

namespace App\Entity\Exercise\ExercisePhaseTypes;

use App\Entity\Exercise\ExercisePhase;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Exercise\ExercisePhaseRepository")
 */
class VideoCutPhase extends ExercisePhase
{
    const PHASE_COMPONENTS = [
        ExercisePhase::VIDEO_PLAYER,
        //ExercisePhase::DOCUMENT_UPLOAD,
    ];

    const PHASE_COMPONENTS_GROUP = [
        //ExercisePhase::CHAT,
        //ExercisePhase::SHARED_DOCUMENT,
    ];

    public function __construct(string $id = null)
    {
        parent::__construct($id);
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this::TYPE_VIDEO_CUTTING;
    }

    /**
     * @return array
     */
    public function getAllowedComponents(): array
    {
        if ($this->isGroupPhase()) {
            return array_merge(self::PHASE_COMPONENTS, self::PHASE_COMPONENTS_GROUP);
        } else {
            return self::PHASE_COMPONENTS;
        }
    }
}
