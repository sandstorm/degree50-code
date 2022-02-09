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

    public static function create(
        User $teamMember,
        ServerSideSolutionLists $serverSideSolutionLists,
        string $solutionId,
        ?ClientSideCutVideo $cutVideo
    ): PreviousSolutionDto
    {
        return new self($teamMember, $serverSideSolutionLists, $solutionId, $cutVideo);
    }

    private function __construct(
        User $teamMember,
        ServerSideSolutionLists $serverSideSolutionLists,
        string $solutionId,
        ?ClientSideCutVideo $cutVideo
    )
    {
        $this->teamMember = $teamMember;
        $this->serverSideSolutionLists = $serverSideSolutionLists;
        $this->solutionId = $solutionId;
        $this->cutVideo = $cutVideo;
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
}
