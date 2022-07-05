<?php

namespace App\Exercise\Controller\Dto;

use App\Entity\Account\User;
use App\Entity\Exercise\ServerSideSolutionData\ServerSideSolutionData;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideCutVideo;

class PreviousSolutionDto
{
    private User $teamMember;
    private ServerSideSolutionData $serverSideSolutionData;
    private string $solutionId;
    private ?ClientSideCutVideo $cutVideo;
    private ?bool $fromGroupPhase;

    public static function create(
        User $teamMember,
        ServerSideSolutionData $serverSideSolutionData,
        string $solutionId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase,
    ): PreviousSolutionDto
    {
        return new self($teamMember, $serverSideSolutionData, $solutionId, $cutVideo, $fromGroupPhase);
    }

    private function __construct(
        User $teamMember,
        ServerSideSolutionData $serverSideSolutionData,
        string $solutionId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase,
    )
    {
        $this->teamMember = $teamMember;
        $this->serverSideSolutionData = $serverSideSolutionData;
        $this->solutionId = $solutionId;
        $this->cutVideo = $cutVideo;
        $this->fromGroupPhase = $fromGroupPhase;
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
}
