<?php

namespace App\Schreibtisch\Service;

use App\Admin\Controller\UserService;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseStatus;
use App\Entity\Video\VideoFavorite;
use App\Exercise\Controller\ExercisePhaseService;
use App\Exercise\Controller\ExerciseService;
use App\Mediathek\Service\VideoFavouritesService;
use App\Twig\AppRuntime;

class SchreibtischService
{
    private ExerciseService $exerciseService;
    private UserService $userService;
    private ExercisePhaseService $exercisePhaseService;
    private VideoFavouritesService $videoFavouritesService;
    private AppRuntime $appRuntime;

    public function __construct(
        ExerciseService $exerciseService,
        UserService $userService,
        ExercisePhaseService $exercisePhaseService,
        VideoFavouritesService $videoFavouritesService,
        AppRuntime $appRuntime,
    ) {
        $this->exerciseService = $exerciseService;
        $this->userService = $userService;
        $this->exercisePhaseService = $exercisePhaseService;
        $this->videoFavouritesService = $videoFavouritesService;
        $this->appRuntime = $appRuntime;
    }

    public function getExercisesApiResponse(): array
    {
        $user = $this->userService->getLoggendInUser();
        $exercises = $this->exerciseService->getExercisesForUser($user);

        return array_map(fn (Exercise $exercise) => [
            'id' => $exercise->getId(),
            'name' => $exercise->getName(),
            'course' => $exercise->getCourse()->getName(),
            'status' => $this->exerciseService->getExerciseStatusForUser($exercise, $user)->value,
            'phaseCount' => $exercise->getPhases()->count(),
            'completedPhases' => $exercise->getPhases()
                ->filter(
                    fn (ExercisePhase $exercisePhase) =>
                    $this->exercisePhaseService->getStatusForUser($exercisePhase, $user) === ExercisePhaseStatus::BEENDET
                )
                ->count(),
        ], $exercises);
    }

    public function getVideoFavoritesResponse(): array
    {
        $user = $this->userService->getLoggendInUser();
        $videoFavorites = $this->videoFavouritesService->getFavouriteVideosForUser($user);

        return array_map(fn (VideoFavorite $videoFavorite) => [
            'id' => $videoFavorite->getId(),
            'video' => $videoFavorite->getVideo()->getAsArray($this->appRuntime)
        ], $videoFavorites);
    }
}
