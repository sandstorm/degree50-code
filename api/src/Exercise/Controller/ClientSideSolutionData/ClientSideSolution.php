<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use JsonSerializable;

/**
 * Client side represenation of a solution.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideSolution implements JsonSerializable
{

    private ClientSideSolutionLists $clientSideSolutionLists;
    private string $id;
    private string $userName;
    private string $userId;
    private ?ClientSideCutVideo $cutVideo;
    private ?bool $fromGroupPhase;

    private function __construct(
        ClientSideSolutionLists $clientSideSolutionLists,
        string $id,
        string $userName,
        string $userId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase
    )
    {
        $this->clientSideSolutionLists = $clientSideSolutionLists;
        $this->id = $id;
        $this->userName = $userName;
        $this->userId = $userId;
        $this->cutVideo = $cutVideo;
        $this->fromGroupPhase = $fromGroupPhase;
    }

    public static function create(
        ClientSideSolutionLists $clientSideSolutionLists,
        string $id,
        string $userName,
        string $userId,
        ?ClientSideCutVideo $cutVideo,
        ?bool $fromGroupPhase
    ): ClientSideSolution
    {
        return new self($clientSideSolutionLists, $id, $userName, $userId, $cutVideo, $fromGroupPhase);
    }

    public static function fromArray(array $input): ClientSideSolution
    {
        return new self(
            ClientSideSolutionLists::fromArray($input['solution']),
            $input['id'],
            $input['userName'],
            $input['userId'],
            ClientSideCutVideo::fromArray($input['cutVideo']),
            $input['fromGroupPhase'],
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'solutionLists' => $this->clientSideSolutionLists->jsonSerialize(),
            'id' => $this->id,
            'userName' => $this->userName,
            'userId' => $this->userId,
            'cutVideo' => $this->cutVideo,
            'fromGroupPhase' => $this->fromGroupPhase
        ];
    }

    /**
     * Get clientSideSolutionLists.
     */
    public function getClientSideSolutionLists(): ClientSideSolutionLists
    {
        return $this->clientSideSolutionLists;
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
}
