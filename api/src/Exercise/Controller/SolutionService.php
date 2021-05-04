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
use Doctrine\Persistence\ManagerRegistry;
use Psr\Log\LoggerInterface;

class SolutionService {
    private AppRuntime $appRuntime;
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private ManagerRegistry $managerRegistry;
    private LoggerInterface $logger;

    function __construct(
        AutosavedSolutionRepository $autosavedSolutionRepository,
        LoggerInterface $logger,
        AppRuntime $appRuntime,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        ExercisePhaseRepository $exercisePhaseRepository,
        ManagerRegistry $managerRegistry
    )
    {
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->appRuntime = $appRuntime;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->logger = $logger;
        $this->managerRegistry = $managerRegistry;
    }

    public function retrieveAndAddDataToClientSideDataBuilderForSolutionView(
        ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder,
        array $teams
    ) {
        // FIXME
        // apparently we need to disable this filter here, because otherwise we can't access the cutVideo on our solution.
        // However it is rather intransparent when and why that happens.
        // Therefore we should probably find a way to fix and document this.
        $this->managerRegistry->getManager()->getFilters()->disable('video_doctrine_filter');

        $previousSolutionDtos = array_map(function($exercisePhaseTeam) {
            /** @var ExercisePhaseTeam $exercisePhaseTeam */
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

        // Get configured videoCodePrototypes from ExercisePhase
        if (!empty($teams)) {
            $exercisePhase = $teams[0]->getExercisePhase();
            $configuredVideoCodePrototypes = array_map(function(VideoCode $videoCodePrototypeEntity) {
                return ServerSideVideoCodePrototype::fromVideoCodeEntity($videoCodePrototypeEntity);
            }, $exercisePhase->getVideoCodes()->toArray());

            $clientSideSolutionDataBuilder->addVideoCodePrototypes($configuredVideoCodePrototypes);
        }

        return $clientSideSolutionDataBuilder;
    }

    public function retrieveAndAddDataToClientSideDataBuilder(
        ClientSideSolutionDataBuilder $clientSideSolutionDataBuilder,
        ExercisePhaseTeam $exercisePhaseTeam,
        ExercisePhase $exercisePhase
    ) {
        // Note: This might either be an autosaved solution or an actual solution
        // FIXME: we should probably find a better way to handle solutions and autosavedSolutions in general.
        $solutionEntity = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);
        $configuredVideoCodePrototypes = array_map(function(VideoCode $videoCodePrototypeEntity) {
            return ServerSideVideoCodePrototype::fromVideoCodeEntity($videoCodePrototypeEntity);
        }, $exercisePhase->getVideoCodes()->toArray());
        $solutionId = $exercisePhaseTeam->getSolution()->getId();
        $previousSolutionDtos = $this->getPreviousSolutionDtosForVideoEditor($exercisePhase, $exercisePhaseTeam);

        // FIXME
        // apparently we need to disable this filter here, because otherwise we can't access the cutVideo on our solution.
        // However it is rather intransparent when and why that happens.
        // Therefore we should probably find a way to fix and document this.
        // TODO we need to at least test this (@see {server-to-client-solution-conversion.feature}
        $this->managerRegistry->getManager()->getFilters()->disable('video_doctrine_filter');
        $cutVideo = $exercisePhaseTeam->getSolution()->getCutVideo();
        $clientSideCutVideo = $cutVideo ? $cutVideo->getAsArray($this->appRuntime) : null;

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
                        // TODO: parameter type mismatch
                        $solutionEntity->getCutVideo()
                    )]);
                }, []);
            }
        }

        return [];
    }
}
