<?php

namespace App\Domain\Solution\Dto\ClientSideSolutionData;

use App\Domain\ExercisePhase\ExercisePhaseStatus;
use JsonSerializable;

/**
 * Client side representation of a solution.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideSolution implements JsonSerializable
{

    private function __construct(
        private readonly ClientSideSolutionData $clientSideSolutionData,
        private readonly string                 $id,
        private readonly string                 $userName,
        private readonly string                 $userId,
        private readonly ?ClientSideCutVideo    $cutVideo,
        private readonly ?bool                  $fromGroupPhase,
        private readonly ?ExercisePhaseStatus   $status,
    )
    {
    }

    public static function create(
        ClientSideSolutionData $clientSideSolutionData,
        string                 $id,
        string                 $userName,
        string                 $userId,
        ?ClientSideCutVideo    $cutVideo,
        ?bool                  $fromGroupPhase,
        ExercisePhaseStatus    $status,
    ): ClientSideSolution
    {
        return new self($clientSideSolutionData, $id, $userName, $userId, $cutVideo, $fromGroupPhase, $status);
    }

    public static function fromArray(array $input): ClientSideSolution
    {
        return new self(
            ClientSideSolutionData::fromArray($input['solution']),
            $input['id'],
            $input['userName'],
            $input['userId'],
            ClientSideCutVideo::fromArray($input['cutVideo']),
            $input['fromGroupPhase'],
            $input['status'],
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'solutionData' => $this->clientSideSolutionData->jsonSerialize(),
            'id' => $this->id,
            'userName' => $this->userName,
            'userId' => $this->userId,
            'cutVideo' => $this->cutVideo,
            'fromGroupPhase' => $this->fromGroupPhase,
            'status' => $this->status,
        ];
    }

    /**
     * Get clientSideSolutionData.
     */
    public function getClientSideSolutionData(): ClientSideSolutionData
    {
        return $this->clientSideSolutionData;
    }

    /**
     * Get id.
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * Get userName.
     */
    public function getUserName(): string
    {
        return $this->userName;
    }

    /**
     * Get userId.
     */
    public function getUserId(): string
    {
        return $this->userId;
    }

    /**
     * Get cutVideo.
     */
    public function getCutVideo(): ?ClientSideCutVideo
    {
        return $this->cutVideo;
    }

    /**
     * Get fromGroupPhase.
     */
    public function getFromGroupPhase(): ?bool
    {
        return $this->fromGroupPhase;
    }

    public function getStatus(): ExercisePhaseStatus
    {
        return $this->status;
    }
}
