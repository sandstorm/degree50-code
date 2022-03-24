<?php

namespace App\Exercise\Controller\Dto;

use App\Entity\Account\User;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideSolutionLists;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideCutVideo;

class PreviousSolutionDto
{
    private User $teamMember;
    private ServerSideSolutionLists $serverSideSolutionLists;
    private string $solutionId;
    private ?ClientSideCutVideo $cutVideo;
    private ?bool $fromGroupPhase;

    public static function create(
        User $teamMember,
        ServerSideSolutionLists $serverSideSolutionLists,
        string $solutionId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase,
    ): PreviousSolutionDto
    {
        return new self($teamMember, $serverSideSolutionLists, $solutionId, $cutVideo, $fromGroupPhase);
    }

    private function __construct(
        User $teamMember,
        ServerSideSolutionLists $serverSideSolutionLists,
        string $solutionId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase,
    )
    {
        $this->teamMember = $teamMember;
        $this->serverSideSolutionLists = $serverSideSolutionLists;
        $this->solutionId = $solutionId;
        $this->cutVideo = $cutVideo;
        $this->fromGroupPhase = $fromGroupPhase;
    }

    public function getTeamMember(): User
    {
        return $this->teamMember;
    }

    public function getServerSideSolutionLists(): ServerSideSolutionLists
    {
        return $this->serverSideSolutionLists;
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
