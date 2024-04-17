<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ServerSideSolutionData\ServerSideVideoCodePrototype;
use App\Entity\Exercise\VideoCode;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\Controller\Dto\PreviousSolutionDto;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Twig\AppRuntime;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\Persistence\ManagerRegistry;

class SolutionService
{

    public function __construct(
        private readonly AutosavedSolutionRepository $autosavedSolutionRepository,
        private readonly AppRuntime                  $appRuntime,
        private readonly ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        private readonly ManagerRegistry             $managerRegistry,
        private readonly ExercisePhaseService        $exercisePhaseService,
    )
    {
    }

    /**
     * @param ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder
     * @param ExercisePhaseTeam[] $teams
     * @return ClientSideSolutionDataBuilder
     */
    public function retrieveAndAddDataToClientSideDataBuilderForSolutionView(
        ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder,
        array                         $teams
    ): ClientSideSolutionDataBuilder
    {
        // FIXME
        // apparently we need to disable this filter here, because otherwise we can't access the cutVideo on our solution.
        // However it is rather intransparent when and why that happens.
        // Therefore we should probably find a way to fix and document this.
        $this->managerRegistry->getManager()->getFilters()->disable('video_doctrine_filter');

        $previousSolutionDtos = array_map(function ($exercisePhaseTeam) {
            $solutionEntity = $exercisePhaseTeam->getSolution();
            $exercisePhase = $exercisePhaseTeam->getExercisePhase();

            $cutVideo = $solutionEntity->getCutVideo();
            $clientSideCutVideo = $cutVideo?->getAsClientSideVideo($this->appRuntime);

            return PreviousSolutionDto::create(
                $exercisePhaseTeam->getCreator(),
                $solutionEntity->getSolution(),
                $solutionEntity->getId(),
                $clientSideCutVideo,
                $exercisePhase->isGroupPhase(),
                $this->exercisePhaseService->getStatusForTeam($exercisePhaseTeam)
            );
        }, $teams);

        /**
         * @var PreviousSolutionDto $previousSolutionDto
         */
        foreach ($previousSolutionDtos as $previousSolutionDto) {
            $clientSideSolutionDataBuilder->addPreviousSolution(
                $previousSolutionDto->getServerSideSolutionData(),
                $previousSolutionDto->getSolutionId(),
                $previousSolutionDto->getTeamMember(),
                $previousSolutionDto->getCutVideo(),
                $previousSolutionDto->getFromGroupPhase(),
                $previousSolutionDto->getStatus(),
            );
        }

        // Get configured videoCodePrototypes from ExercisePhase
        if (!empty($teams)) {
            $exercisePhase = $teams[0]->getExercisePhase();

            $configuredVideoCodePrototypes = [];
            if ($exercisePhase instanceof VideoAnalysisPhase) {
                $configuredVideoCodePrototypes = array_map(function (VideoCode $videoCodePrototypeEntity) {
                    return ServerSideVideoCodePrototype::fromVideoCodeEntity($videoCodePrototypeEntity);
                }, $exercisePhase->getVideoCodes()->toArray());
            }

            $clientSideSolutionDataBuilder->addVideoCodePrototypes($configuredVideoCodePrototypes);
        }

        return $clientSideSolutionDataBuilder;
    }

    public function retrieveAndAddDataToClientSideDataBuilder(
        ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder,
        ExercisePhaseTeam             $exercisePhaseTeam,
        ExercisePhase                 $exercisePhase
    ): ClientSideSolutionDataBuilder
    {
        // Note: This might either be an autosaved solution or an actual solution
        // FIXME: we should probably find a better way to handle solutions and autosavedSolutions in general.
        $solutionEntity = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

        $configuredVideoCodePrototypes = [];

        if ($exercisePhase instanceof VideoAnalysisPhase) {
            $configuredVideoCodePrototypes = array_map(function (VideoCode $videoCodePrototypeEntity) {
                return ServerSideVideoCodePrototype::fromVideoCodeEntity($videoCodePrototypeEntity);
            }, $exercisePhase->getVideoCodes()->toArray());
        }

        $solutionId = $exercisePhaseTeam->getSolution()->getId();
        $previousSolutionDtos = $this->getPreviousSolutionDtosForVideoEditor($exercisePhase, $exercisePhaseTeam);

        // FIXME
        // apparently we need to disable this filter here, because otherwise we can't access the cutVideo on our solution.
        // However it is rather intransparent when and why that happens.
        // Therefore we should probably find a way to fix and document this.
        // TODO we need to at least test this (@see {server-to-client-solution-conversion.feature}
        $this->managerRegistry->getManager()->getFilters()->disable('video_doctrine_filter');
        $cutVideo = $exercisePhaseTeam->getSolution()->getCutVideo();

        $clientSideCutVideo = $cutVideo?->getAsClientSideVideo($this->appRuntime);

        $clientSideSolutionDataBuilder
            ->addCurrentSolution($solutionEntity->getSolution(), $exercisePhaseTeam, $clientSideCutVideo)
            ->addVideoCodePrototypesToSolution($configuredVideoCodePrototypes, $solutionId);

        /**
         * @var PreviousSolutionDto $previousSolutionDto
         */
        foreach ($previousSolutionDtos as $previousSolutionDto) {
            $clientSideSolutionDataBuilder->addPreviousSolution(
                $previousSolutionDto->getServerSideSolutionData(),
                $previousSolutionDto->getSolutionId(),
                $previousSolutionDto->getTeamMember(),
                $previousSolutionDto->getCutVideo(),
                $previousSolutionDto->getFromGroupPhase(),
                $previousSolutionDto->getStatus(),
            );
        }

        return $clientSideSolutionDataBuilder;
    }

    private function getPreviousSolutionDtosForVideoEditor(
        ExercisePhase     $exercisePhase,
        ExercisePhaseTeam $exercisePhaseTeam = null
    )
    {
        // Get the relevant solutions of the previous phase,
        // meaning we get the solutions of each of the members of the current team
        $exercisePhaseDependedOn = $exercisePhase->getDependsOnExercisePhase();
        if ($exercisePhaseDependedOn !== null && $exercisePhaseTeam != null) {
            // FIXME
            // we can probably retrieve previous phases with a single query instead
            return array_reduce(
                $exercisePhaseTeam->getMembers()->toArray(),
                function (array $carry, User $teamMember) use ($exercisePhaseDependedOn, $exercisePhaseTeam) {
                    $teamOfPreviousPhase = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($teamMember, $exercisePhaseDependedOn);
                    $solutionEntity = $teamOfPreviousPhase?->getSolution();

                    if (is_null($solutionEntity)) {
                        return $carry;
                    }

                    $clientSideCutVideo = null;

                    try {
                        $clientSideCutVideo = $solutionEntity->getCutVideo()?->getAsClientSideVideo($this->appRuntime);
                    } catch (EntityNotFoundException $e) {
                    }

                    return array_merge($carry, [PreviousSolutionDto::create(
                        $teamMember,
                        $solutionEntity->getSolution(),
                        $solutionEntity->getId(),
                        $clientSideCutVideo,
                        $exercisePhaseDependedOn->isGroupPhase(),
                        $this->exercisePhaseService->getStatusForTeam($exercisePhaseTeam)
                    )]);
                },
                []
            );
        }

        return [];
    }
}
