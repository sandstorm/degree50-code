<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseStatus;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\MaterialPhase;
use App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;

class ExercisePhaseService
{
    private DoctrineIntegratedEventStore $eventStore;
    private EntityManagerInterface $entityManager;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
    ) {
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
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

        // MaterialPhase can depend on VideoAnalysis & VideoCutting
        if (
            $dependingPhase->getType() === ExercisePhaseType::MATERIAL && ($phaseDependingOn->getType() === ExercisePhaseType::VIDEO_ANALYSIS
                || $phaseDependingOn->getType() === ExercisePhaseType::VIDEO_CUT
            )
        ) {
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
                    case ExercisePhaseType::VIDEO_ANALYSIS: {
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

    public static function finishPhase(ExercisePhaseTeam $phaseTeam): void
    {
        $exercisePhase = $phaseTeam->getExercisePhase();

        switch ($exercisePhase->getType()) {
            case ExercisePhaseType::MATERIAL:
                /** @var MaterialPhase $materialPhase */
                $materialPhase = $exercisePhase;

                if ($phaseTeam->getStatus() !== ExercisePhaseStatus::IN_BEARBEITUNG) {
                    return;
                }

                if ($materialPhase->getReviewRequired()) {
                    $phaseTeam->setStatus(ExercisePhaseStatus::IN_REVIEW);
                } else {
                    $phaseTeam->setStatus(ExercisePhaseStatus::BEENDET);
                }
                break;
            default:
                $phaseTeam->setStatus(ExercisePhaseStatus::BEENDET);
                break;
        }
    }

    public function finishReview(ExercisePhaseTeam $phaseTeam): void
    {
        $phaseTeam->setStatus(ExercisePhaseStatus::BEENDET);

        $this->eventStore->addEvent('ExercisePhaseStatusUpdated', [
            'exercisePhaseTeamId' => $phaseTeam->getId(),
            'status' => ExercisePhaseStatus::BEENDET
        ]);

        $this->entityManager->persist($phaseTeam);
        $this->entityManager->flush();
    }

    public function openPhase(ExercisePhaseTeam $exercisePhaseTeam): void
    {
        $exercisePhase = $exercisePhaseTeam->getExercisePhase();

        if (
            $exercisePhase instanceof MaterialPhase &&
            ($this->getStatusForTeam($exercisePhaseTeam) === ExercisePhaseStatus::BEENDET ||
                $this->getStatusForTeam($exercisePhaseTeam) === ExercisePhaseStatus::IN_REVIEW
            )
        ) {
            // WHY:
            // When a material phase is finished, the final material will be copied to each
            // students dashboard. It would not make sense to allow re-opening the phase in this
            // scenario.
            return; // NoOp
        } else {
            // WHY:
            // While we set the status to "IN_BEARBEITUNG" when we initally create the phase,
            // a user might re-enter the phase after the status has already been set to "BEENDET".
            // In that case we want the phase to reflect that, by having the "IN_BEARBEITUNG" status again.
            $exercisePhaseTeam->setStatus(ExercisePhase\ExercisePhaseStatus::IN_BEARBEITUNG);

            $this->eventStore->addEvent('ExercisePhaseStatusUpdated', [
                'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
                'status' => ExercisePhaseStatus::IN_BEARBEITUNG
            ]);

            $this->entityManager->persist($exercisePhaseTeam);
            $this->entityManager->flush();
        }
    }

    /**
     * Get the exercise phase status for a single team
     */
    public static function getStatusForTeam(?ExercisePhaseTeam $exercisePhaseTeam): ExercisePhaseStatus
    {
        if (is_null($exercisePhaseTeam)) {
            return ExercisePhaseStatus::INITIAL;
        } else {
            return $exercisePhaseTeam->getStatus();
        }
    }

    /**
     * Get the exercise phase status for a single user
     * */
    public function getStatusForUser(ExercisePhase $exercisePhase, User $user): ExercisePhaseStatus
    {
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);

        return $this->getStatusForTeam($exercisePhaseTeam);
    }

    /**
     * Get the exercise phase status for all teams and checks if at least one team has a solution
     * to review.
     * */
    public function phaseHasAtLeastOneSolutionToReview(ExercisePhase $exercisePhase): bool
    {
        $exercisePhaseTeams = $exercisePhase->getTeams();

        return $exercisePhaseTeams->exists(
            fn ($_key, $team) => $this->getStatusForTeam($team) === ExercisePhaseStatus::IN_REVIEW
        );
    }
}
