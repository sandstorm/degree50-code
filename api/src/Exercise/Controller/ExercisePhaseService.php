<?php

namespace App\Exercise\Controller;

use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;

class ExercisePhaseService
{
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore)
    {
        $this->eventStore = $eventStore;
    }

    /**
     * Check if the combination of ExercisePhase "depending on" and the "depending" ExercisePhase is valid.
     */
    public function isValidDependingOnExerciseCombination(ExercisePhase $phaseDependingOn, ExercisePhase $dependingPhase): bool
    {
        // check sorting: $phaseDependingOn must come _before_ this $dependingPhase
        if ($phaseDependingOn->getSorting() >= $dependingPhase->getSorting()) {
            return false;
        }

        // check type combination

        // Reflexion can depend on any other(!) type
        if ($dependingPhase->getType() === ExercisePhaseType::REFLEXION && $phaseDependingOn->getType() !== ExercisePhaseType::REFLEXION) {
            return true;
        }

        // VideoCutting can depend on VideoAnalysis
        if ($dependingPhase->getType() === ExercisePhaseType::VIDEO_CUT && $phaseDependingOn->getType() === ExercisePhaseType::VIDEO_ANALYSIS) {
            return true;
        }

        // other combinations are invalid
        return false;
    }

    /**
     * @return ExercisePhase[]|Collection<ExercisePhase>
     */
    public function duplicatePhasesOfExercise(Exercise $originalExercise, Exercise $newExercise): Collection
    {
        $newPhases = $originalExercise->getPhases()->map(
            function (ExercisePhase $originalPhase) use ($newExercise) {
                $newPhase = match ($originalPhase->getType()) {
                    ExercisePhaseType::VIDEO_ANALYSIS => new VideoAnalysisPhase(),
                    ExercisePhaseType::VIDEO_CUT => new VideoCutPhase(),
                    ExercisePhaseType::REFLEXION => new ReflexionPhase(),
                };

                switch ($originalPhase->getType()) {
                    case ExercisePhaseType::VIDEO_ANALYSIS:
                    {
                        /** @var VideoAnalysisPhase $newPhase */
                        /** @var VideoAnalysisPhase $originalPhase */
                        $newPhase->setVideoAnnotationsActive($originalPhase->getVideoAnnotationsActive());
                        $newPhase->setVideoCodesActive($originalPhase->getVideoCodesActive());

                        // create new VideoCodes from original VideoCodes
                        foreach ($originalPhase->getVideoCodes() as $_key => $videoCode) {
                            $newVideoCode = new VideoCode();
                            $newVideoCode->setName($videoCode->getName());
                            $newVideoCode->setColor($videoCode->getColor());

                            $newVideoCode->setExercisePhase($newPhase);
                            $newPhase->addVideoCode($newVideoCode);
                        };
                        break;
                    }
                    case ExercisePhaseType::VIDEO_CUT:
                    case ExercisePhaseType::REFLEXION:
                        break;
                }

                $newPhase->setName($originalPhase->getName());
                $newPhase->setTask($originalPhase->getTask());
                $newPhase->setSorting($originalPhase->getSorting());
                $newPhase->setComponents($originalPhase->getComponents());
                $newPhase->setIsGroupPhase($originalPhase->isGroupPhase());
                $newPhase->setOtherSolutionsAreAccessible($originalPhase->getOtherSolutionsAreAccessible());

                foreach ($originalPhase->getAttachment() as $_key => $attachment) {
                    $newPhase->addAttachment($attachment);
                }

                foreach ($originalPhase->getVideos() as $_key => $video) {
                    // WHY: The video also needs to be made available in the Course of the new Exercise
                    $newExercise->getCourse()->addVideo($video);
                    $newPhase->addVideo($video);
                }

                $newPhase->setBelongsToExercise($newExercise);

                $this->eventStore->addEvent('ExercisePhaseCreated', [
                    'exercisePhaseId' => $newPhase->getId(),
                    'type' => $newPhase->getType()->value,
                ]);

                return $newPhase;
            }
        );

        // depends on exercisePhase
        $originalExercise->getPhases()->map(
            function (ExercisePhase $originalPhase) use ($newPhases, $originalExercise) {
                if ($originalPhase->getDependsOnExercisePhase() !== null) {
                    $indexOfDependingExercise = $originalExercise->getPhases()->indexOf($originalPhase);
                    $indexOfExerciseDependingOn = $originalExercise->getPhases()->indexOf($originalPhase->getDependsOnExercisePhase());

                    /** @var ExercisePhase $newDependingPhase */
                    $newDependingPhase = $newPhases->get($indexOfDependingExercise);
                    /** @var ExercisePhase $newDependingPhase */
                    $newPhaseDependingOn = $newPhases->get($indexOfExerciseDependingOn);

                    $newDependingPhase->setDependsOnExercisePhase($newPhaseDependingOn);
                }
            }
        );

        return $newPhases;
    }
}
