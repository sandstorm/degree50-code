<?php

namespace App\Schreibtisch\Service;

use App\Admin\Controller\UserService;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseStatus;
use App\Entity\Exercise\ExerciseStatus;
use App\Entity\Material\Material;
use App\Entity\Video\VideoFavorite;
use App\Exercise\Controller\ExercisePhaseService;
use App\Exercise\Controller\ExerciseService;
use App\Mediathek\Service\VideoFavouritesService;
use App\Service\UserMaterialService;
use App\Twig\AppRuntime;
use DateTimeImmutable;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class SchreibtischService
{
    private ExerciseService $exerciseService;
    private UserService $userService;
    private ExercisePhaseService $exercisePhaseService;
    private VideoFavouritesService $videoFavouritesService;
    private UserMaterialService $materialService;
    private UrlGeneratorInterface $router;
    private AppRuntime $appRuntime;

    public function __construct(
        ExerciseService $exerciseService,
        UserService $userService,
        ExercisePhaseService $exercisePhaseService,
        VideoFavouritesService $videoFavouritesService,
        UserMaterialService $materialService,
        AppRuntime $appRuntime,
        UrlGeneratorInterface $router,
    ) {
        $this->exerciseService = $exerciseService;
        $this->userService = $userService;
        $this->exercisePhaseService = $exercisePhaseService;
        $this->videoFavouritesService = $videoFavouritesService;
        $this->appRuntime = $appRuntime;
        $this->materialService = $materialService;
        $this->router = $router;
    }

    private function sortByExerciseStatus(ExerciseStatus $statusA, ExerciseStatus $statusB)
    {
        if ($statusA === ExerciseStatus::NEU && $statusB !== ExerciseStatus::NEU) {
            return -1;
        } else if ($statusA !== ExerciseStatus::NEU && $statusB === ExerciseStatus::NEU) {
            return 1;
        } else if ($statusA === ExerciseStatus::IN_BEARBEITUNG && $statusB === ExerciseStatus::BEENDET) {
            return -1;
        } else if ($statusB === ExerciseStatus::IN_BEARBEITUNG && $statusA === ExerciseStatus::BEENDET) {
            return 1;
        } else {
            return 0;
        }
    }

    private function sortByDateTimeImmutable(?DateTimeImmutable $dateA, ?DateTimeImmutable $dateB)
    {
        if ($dateA === $dateB) {
            return 0;
        } else {
            return $dateA < $dateB
                ? 1
                : -1;
        }
    }

    public function getExercisesApiResponse(): array
    {
        $user = $this->userService->getLoggendInUser();
        $exercises = $this->exerciseService->getExercisesForUser($user);
        $exercisesCopy = [...$exercises];
        usort($exercisesCopy, function (Exercise $eA, Exercise $eB) use ($user) {
            $statusA = $this->exerciseService->getExerciseStatusForUser($eA, $user);
            $statusB = $this->exerciseService->getExerciseStatusForUser($eB, $user);
            $sortedByStatus = $this->sortByExerciseStatus($statusA, $statusB);

            // In this case we compared these elements and already know there current new sorting,
            // because of their status (because they are different)
            if ($sortedByStatus !== 0) {
                return $sortedByStatus;
            }

            $lastEditDateA = $this->exerciseService->getLastEditDateByUser($eA, $user);
            $lastEditDateB = $this->exerciseService->getLastEditDateByUser($eB, $user);

            return $this->sortByDateTimeImmutable($lastEditDateA, $lastEditDateB);
        });

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
            'lastEditedAt' => $this->exerciseService->getLastEditDateByUser($exercise, $user)
        ], $exercisesCopy);
    }

    public function getVideoFavoritesResponse(): array
    {
        $user = $this->userService->getLoggendInUser();
        $videoFavorites = $this->videoFavouritesService->getFavouriteVideosForUser($user);

        return array_map(fn (VideoFavorite $videoFavorite) => [
            'id' => $videoFavorite->getId(),
            'video' => array_merge(
                $videoFavorite->getVideo()->getAsClientSideVideo($this->appRuntime)->toArray(),
                [
                    'userIsCreator' => $user === $videoFavorite->getVideo()->getCreator()
                ]
            )
        ], $videoFavorites);
    }

    public function getMaterialResponse(): array
    {
        $user = $this->userService->getLoggendInUser();
        $materialList = $this->materialService->getMaterialsForUser($user);

        $mateiralListCopy = [...$materialList];

        usort($mateiralListCopy, function (Material $materialA, Material $materialB) {
            if (is_null($materialA->getLastUpdatedAt()) && is_null($materialB->getLastUpdatedAt())) {
                return $this->sortByDateTimeImmutable($materialA->getCreatedAt(), $materialB->getCreatedAt());
            } else if (is_null($materialA->getLastUpdatedAt()) && !is_null($materialB->getLastUpdatedAt())) {
                return -1;
            } else if (!is_null($materialA->getLastUpdatedAt()) && is_null(($materialB->getLastUpdatedAt()))) {
                return 1;
            } else {
                return $this->sortByDateTimeImmutable($materialA->getLastUpdatedAt(), $materialB->getLastUpdatedAt());
            }
        });

        return array_map(function (Material $material) {
            $originalExercisePhaseTeam = $material->getOriginalPhaseTeam();
            $originalExercisePhase = $originalExercisePhaseTeam->getExercisePhase();
            $originalExercise = $originalExercisePhase->getBelongsToExercise();

            return [
                'id' => $material->getId(),
                'material' => $material->getMaterial(),
                'owner' => $material->getOwner()->getUsername(),
                'originalExercisePhaseTeamId' => $originalExercisePhaseTeam->getId(),
                'originalExercisePhaseName' => $originalExercisePhase->getName(),
                'originalExercisePhaseUrl' => $this->router->generate(
                    "exercise-overview__exercise--show-phase-overview",
                    [
                        "id" => $originalExercise->getId(),
                        "phaseId" => $originalExercisePhase->getId()
                    ]
                ),
                'createdAt' => $material->getCreatedAt(),
                'lastUpdatedAt' => $material->getLastUpdatedAt()
            ];
        }, $mateiralListCopy);
    }
}
