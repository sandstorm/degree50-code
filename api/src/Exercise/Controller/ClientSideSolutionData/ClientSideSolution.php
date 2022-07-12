<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Exercise\ExercisePhase\ExercisePhaseStatus;
use JsonSerializable;

/**
 * Client side represenation of a solution.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideSolution implements JsonSerializable
{

    private ClientSideSolutionData $clientSideSolutionData;
    private string $id;
    private string $userName;
    private string $userId;
    private ?ClientSideCutVideo $cutVideo;
    private ?bool $fromGroupPhase;
    private ?ExercisePhaseStatus $status;

    private function __construct(
        ClientSideSolutionData $clientSideSolutionData,
        string $id,
        string $userName,
        string $userId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase,
        ExercisePhaseStatus $status,
    ) {
        $this->clientSideSolutionData = $clientSideSolutionData;
        $this->id = $id;
        $this->userName = $userName;
        $this->userId = $userId;
        $this->cutVideo = $cutVideo;
        $this->fromGroupPhase = $fromGroupPhase;
        $this->status = $status;
    }

    public static function create(
        ClientSideSolutionData $clientSideSolutionData,
        string $id,
        string $userName,
        string $userId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase,
        ExercisePhaseStatus $status,
    ): ClientSideSolution {
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
