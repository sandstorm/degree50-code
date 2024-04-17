<?php

namespace App\Domain\Solution\Dto;

class PreviousSolutionDto
{
    /**
     * @param User $teamMember
     * @param ServerSideSolutionData $serverSideSolutionData
     * @param string $solutionId
     * @param ClientSideCutVideo|null $cutVideo
     * @param bool|null $fromGroupPhase
     * @param ExercisePhaseStatus|null $status
     */
    private function __construct(
        private User                   $teamMember,
        private ServerSideSolutionData $serverSideSolutionData,
        private string                 $solutionId,
        private ?ClientSideCutVideo    $cutVideo,
        private ?bool                  $fromGroupPhase,
        private ?ExercisePhaseStatus   $status = ExercisePhaseStatus::INITIAL,
    )
    {
    }

    public static function create(
        User                   $teamMember,
        ServerSideSolutionData $serverSideSolutionData,
        string                 $solutionId,
        ?ClientSideCutVideo    $cutVideo,
        ?bool                  $fromGroupPhase,
        ?ExercisePhaseStatus   $status,
    ): PreviousSolutionDto
    {
        return new self($teamMember, $serverSideSolutionData, $solutionId, $cutVideo, $fromGroupPhase, $status);
    }

    public function getTeamMember(): User
    {
        return $this->teamMember;
    }

    public function getServerSideSolutionData(): ServerSideSolutionData
    {
        return $this->serverSideSolutionData;
    }

    public function getSolutionId(): string
    {
        return $this->solutionId;
    }

    public function getCutVideo(): ?ClientSideCutVideo
    {
        return $this->cutVideo;
    }

    /**
     * Get fromGroupPhase.
     */
    public function getFromGroupPhase()
    {
        return $this->fromGroupPhase;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function setStatus($status)
    {
        $this->status = $status;
    }
}
