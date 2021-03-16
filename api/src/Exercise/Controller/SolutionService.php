<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCodePrototype;
use App\Entity\Exercise\VideoCode;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\Controller\Dto\PreviousSolutionDto;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Twig\AppRuntime;
use Psr\Log\LoggerInterface;

class SolutionService {
    private AppRuntime $appRuntime;
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private LoggerInterface $logger;

    function __construct(
        AutosavedSolutionRepository $autosavedSolutionRepository,
        LoggerInterface $logger,
        AppRuntime $appRuntime,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        ExercisePhaseRepository $exercisePhaseRepository
    )
    {
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->appRuntime = $appRuntime;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->logger = $logger;
    }

    public function retrieveAndAddDataToClientSideDataBuilderForSolutionView(
        ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder,
        iterable $teams
    ) {
        /**
         * @var ExercisePhaseTeam $exercisePhaseTeam
         */
        $previousSolutionDtos = array_map(function($exercisePhaseTeam) {
            $solutionEntity = $exercisePhaseTeam->getSolution();

            $cutVideo = $solutionEntity->getCutVideo();
            $clientSideCutVideo = $cutVideo ? $cutVideo->getAsArray($this->appRuntime) : null;

            return PreviousSolutionDto::create(
                $exercisePhaseTeam->getCreator(),
                $solutionEntity->getSolution(),
                $solutionEntity->getId(),
                $clientSideCutVideo
            );
        }, $teams);

        /**
         * @var PreviousSolutionDto $previousSolutionDto
         */
        foreach ($previousSolutionDtos as $previousSolutionDto) {
            $clientSideSolutionDataBuilder->addPreviousSolution(
                $previousSolutionDto->getServerSideSolutionLists(),
                $previousSolutionDto->getSolutionId(),
                $previousSolutionDto->getTeamMember(),
                $previousSolutionDto->getCutVideo()
            );
        }

        return $clientSideSolutionDataBuilder;
    }

    public function retrieveAndAddDataToClientSideDataBuilder(
        ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder,
        ExercisePhaseTeam $exercisePhaseTeam,
        ExercisePhase $exercisePhase
    ) {
        $solutionEntity = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);
        $configuredVideoCodePrototypes = array_map(function(VideoCode $videoCodePrototypeEntity) {
            return ServerSideVideoCodePrototype::fromVideoCodeEntity($videoCodePrototypeEntity);
        }, $exercisePhase->getVideoCodes()->toArray());
        $solutionId = $exercisePhaseTeam->getSolution()->getId();
        $previousSolutionDtos = $this->getPreviousSolutionDtosForVideoEditor($exercisePhase, $exercisePhaseTeam);

        $cutVideo = $exercisePhaseTeam->getSolution()->getCutVideo();
        $clientSideCutVideo = $cutVideo ? $cutVideo->getAsArray($this->appRuntime) : $cutVideo;

        $clientSideSolutionDataBuilder
            ->addCurrentSolution($solutionEntity->getSolution(), $exercisePhaseTeam, $clientSideCutVideo)
            ->addVideoCodePrototypesToSolution($configuredVideoCodePrototypes, $solutionId);

        /**
         * @var PreviousSolutionDto $previousSolutionDto
         */
        foreach ($previousSolutionDtos as $previousSolutionDto) {
            $clientSideSolutionDataBuilder->addPreviousSolution(
                $previousSolutionDto->getServerSideSolutionLists(),
                $previousSolutionDto->getSolutionId(),
                $previousSolutionDto->getTeamMember(),
                $previousSolutionDto->getCutVideo()
            );
        }

        return $clientSideSolutionDataBuilder;
    }

    private function getPreviousSolutionDtosForVideoEditor(
        ExercisePhase $exercisePhase,
        ExercisePhaseTeam  $exercisePhaseTeam = null
    ) {
        // Get the relevant solutions of the previous phase,
        // meaning we get the solutions of each of the members of the current team
        if ($exercisePhase->getDependsOnPreviousPhase() && $exercisePhaseTeam != null) {
            $previousPhase = $this->exercisePhaseRepository->findOneBy([
                'sorting' => $exercisePhase->getSorting() - 1,
                'belongsToExercise' => $exercisePhase->getBelongsToExercise()
            ]);

            if ($previousPhase) {
                // FIXME
                // we can probably retrieve previous phases with a single query instead
                return array_reduce($exercisePhaseTeam->getMembers()->toArray(), function (array $carry, User $teamMember) use ($previousPhase) {
                    $teamOfPreviousPhase = $this->exercisePhaseTeamRepository->findByMember($teamMember, $previousPhase);
                    $solutionEntity = $teamOfPreviousPhase ? $teamOfPreviousPhase->getSolution() : null;

                    if (empty($solutionEntity)) {
                        return $carry;
                    }

                    return array_merge($carry, [PreviousSolutionDto::create(
                        $teamMember,
                        $solutionEntity->getSolution(),
                        $solutionEntity->getId(),
                        $solutionEntity->getCutVideo()
                    )]);
                }, []);
            }
        }

        return [];
    }
}
