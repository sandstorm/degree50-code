<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideAnnotation;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideCut;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideSolutionLists;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCode;
use JsonSerializable;

/**
 * This builder allows to transform server side solution value objects into a normalized
 * datastructure which can be serialized and consumed by the frontend.
 *
 * WHY:
 * Our solution model only stores solutionLists as jsonBlob. This is totally fine
 * for the backend side of things. However our frontend treats annotations, videoCodes etc.
 * as entities and therefore wants them to have ids.
 * This builder serves as a single source of truth of the conversion from serverside solution
 * data to normalized client side solution data.
 *
 * NOTE: The ids for annotations, videoCodes etc. are usually created by concatenating the id
 * of the parent solution with the index of the item inside its parent list.
 * For example
 * @see ClientSideAnnotation::fromServerSideAnnotation()
 *
 * An additional benefit is the enhanced type safety we gain from using value objects for client/server side
 * representations of solution objects.
 */
class ClientSideSolutionDataBuilder implements JsonSerializable {
    /**
     * @var ClientSideSolution[]
     */
    private array $clientSideSolutions;

    /**
     * @var ClientSideAnnotation[]
     */
    private array $clientSideAnnotations;

    /**
     * @var ClientSideVideoCode[]
     */
    private array $clientSideVideoCodes;

    /**
     * @var ClientSideCut[]
     */
    private array $clientSideCuts;

    /**
     * @var ClientSideVideoCodePrototype[]
     */
    private array $clientSideVideoCodePrototypes;

    /**
     * @var ?string
     */
    private ?string $currentSolutionId;

    /**
     * @var string[]
     */
    private array $previousSolutionIds;

    public function __construct()
    {
        $this->clientSideSolutions = [];
        $this->clientSideAnnotations = [];
        $this->clientSideVideoCodes = [];
        $this->clientSideCuts = [];
        $this->clientSideVideoCodePrototypes = [];
        $this->currentSolutionId = null;
        $this->previousSolutionIds = [];
    }

    public function jsonSerialize(): array {
        return [
            'solutions' => [
                'byId' => $this->clientSideSolutions,
                'current' => $this->currentSolutionId,
                'previous' => $this->previousSolutionIds,
            ],
            'annotations' => [
                'byId' => $this->clientSideAnnotations,
            ],
            'videoCodes' => [
                'byId' => $this->clientSideVideoCodes,
            ],
            'cuts' => [
                'byId' => $this->clientSideCuts,
            ],
            'videoCodePrototypes' => [
                'byId' => $this->clientSideVideoCodePrototypes,
            ]
        ];
    }

    public function addCurrentSolution(
        ServerSideSolutionLists $serverSideSolutionLists,
        ExercisePhaseTeam $exercisePhaseTeam,
        ?ClientSideCutVideo $cutVideo
    ) {
        $solutionId = $exercisePhaseTeam->getSolution()->getId();

        $this->addSolution(
            $serverSideSolutionLists,
            $solutionId,
            $exercisePhaseTeam->getCreator(),
            $cutVideo
        );

        $this->currentSolutionId = $solutionId;

        return $this;
    }

    public function addPreviousSolution(
        ServerSideSolutionLists $serverSideSolutionLists,
        string $solutionId,
        User $teamMember,
        ?ClientSideCutVideo $cutVideo
    ) {
        $solutionId = $this->addSolution(
            $serverSideSolutionLists,
            $solutionId,
            $teamMember,
            $cutVideo
        );

        array_push($this->previousSolutionIds, $solutionId);

        return $this;
    }

    private function addSolution(
        ServerSideSolutionLists $serverSideSolutionLists,
        string $solutionId,
        User $solutionCreator,
        ?ClientSideCutVideo $cutVideo
    ) {
        $userName = $solutionCreator->getEmail();
        $userId = $solutionCreator->getId();

        $serverSideAnnotations = $serverSideSolutionLists->getAnnotations();
        $clientSideAnnotationIds = $this->addAnnotations($serverSideAnnotations, $solutionId);

        $serverSideVideoCodes = $serverSideSolutionLists->getVideoCodes();
        $clientSideVideoCodeIds = $this->addVideoCodes($serverSideVideoCodes, $solutionId);

        $serverSideCutList = $serverSideSolutionLists->getCutList();
        $clientSideCutIds = $this->addCuts($serverSideCutList, $solutionId);

        $serverSideVideoCodePrototypes = $serverSideSolutionLists->getVideoCodePrototypes();
        $clientSideVideoCodePrototypeIds = $this->_addVideoCodePrototypes($serverSideVideoCodePrototypes);

        $this->clientSideSolutions[$solutionId] = ClientSideSolution::create(
            ClientSideSolutionLists::create(
                $clientSideAnnotationIds,
                $clientSideVideoCodeIds,
                $clientSideCutIds,
                $clientSideVideoCodePrototypeIds,
            ),
            $solutionId,
            $userName,
            $userId,
            $cutVideo
        );

        return $solutionId;
    }

    public function addVideoCodePrototypesToSolution(array $serverSideVideoCodePrototypes, string $solutionId) {
        $solution = $this->clientSideSolutions[$solutionId];

        $this->clientSideSolutions[$solutionId] = ClientSideSolution::create(
            ClientSideSolutionLists::create(
                $solution->getClientSideSolutionLists()->getAnnotationIds(),
                $solution->getClientSideSolutionLists()->getVideoCodeIds(),
                $solution->getClientSideSolutionLists()->getCutIds(),
                array_unique(array_merge(
                    $solution->getClientSideSolutionLists()->getVideoCodePrototypeIds(),
                    $this->_addVideoCodePrototypes($serverSideVideoCodePrototypes)
                ))
            ),
            $solutionId,
            $solution->getUserName(),
            $solution->getUserId(),
            $solution->getCutVideo()
        );

        return $this;
    }

    private function addAnnotations(array $serverSideAnnotations, string $solutionId) {
        $clientSideAnnotations = array_map(function (ServerSideAnnotation $annotation, int $index) use($solutionId) {
            return ClientSideAnnotation::fromServerSideAnnotation($annotation, $solutionId, $index);
        }, $serverSideAnnotations, array_keys($serverSideAnnotations));

        foreach($clientSideAnnotations as $clientSideAnnotation) {
            $this->clientSideAnnotations[$clientSideAnnotation->getId()] = $clientSideAnnotation;
        }

        $clientSideAnnotationIds = array_map(function (ClientSideAnnotation $annotation) {
            return $annotation->getId();
        }, $clientSideAnnotations);

        return $clientSideAnnotationIds;
    }

    private function addVideoCodes(array $serverSideVideoCodes, string $solutionId) {
        $clientSideVideoCodes = array_map(function (ServerSideVideoCode $videoCode, int $index) use($solutionId) {
            return ClientSideVideoCode::fromServerSideVideoCode($videoCode, $solutionId, $index);
        }, $serverSideVideoCodes, array_keys($serverSideVideoCodes));

        foreach($clientSideVideoCodes as $clientSideVideoCode) {
            $this->clientSideVideoCodes[$clientSideVideoCode->getId()] = $clientSideVideoCode;
        }

        $clientSideVideoCodeIds = array_map(function (ClientSidevideoCode $videoCode) {
            return $videoCode->getId();
        }, $clientSideVideoCodes);

        return $clientSideVideoCodeIds;
    }

    private function addCuts(array $serverSideCutList, string $solutionId) {
        $clientSideCutList = array_map(function (ServerSideCut $cut, int $index) use($solutionId) {
            return ClientSideCut::fromServerSideCut($cut, $solutionId, $index);
        }, $serverSideCutList, array_keys($serverSideCutList));

        foreach($clientSideCutList as $clientSideCut) {
            $this->clientSideCuts[$clientSideCut->getId()] = $clientSideCut;
        }

        $clientSideCutIds = array_map(function (ClientSideCut $cut) {
            return $cut->getId();
        }, $clientSideCutList);

        return $clientSideCutIds;
    }

    /**
     * Creates clientSidePrototypes from serverSidePrototypes and adds them to the clientSideVideoCodePrototypesList
     * Returns the builder itself, so that further methods can be chained.
     */
    public function addVideoCodePrototypes(array $serverSideVideoCodePrototypes) {
        $this->_addVideoCodePrototypes($serverSideVideoCodePrototypes);
        return $this;
    }

    /**
     * Creates clientSidePrototypes from serverSidePrototypes and adds them to the clientSideVideoCodePrototypesList
     * Returns the resulting list.
     *
     * For internal use only!
     */
    private function _addVideoCodePrototypes(array $serverSideVideoCodePrototypes) {
        $clientSideVideoCodePrototypes = array_reduce($serverSideVideoCodePrototypes, function($carry, $videoCodePrototype) {
            $parentPrototype = ClientSideVideoCodePrototype::fromServerSideVideoCodePrototype($videoCodePrototype);
            $childPrototypes = array_map(function($childPrototype) {
                return ClientSideVideoCodePrototype::fromServerSideVideoCodePrototype($childPrototype);
            }, $videoCodePrototype->getChildServerSidePrototypes());

            return array_merge($carry, [$parentPrototype], $childPrototypes);
        }, []);

        foreach($clientSideVideoCodePrototypes as $clientSideVideoCodePrototype) {
            $this->clientSideVideoCodePrototypes[$clientSideVideoCodePrototype->getId()] = $clientSideVideoCodePrototype;
        }

        $clientSideVideoCodePrototypeIds = array_map(function (ClientSidevideoCodePrototype $videoCodePrototype) {
            return $videoCodePrototype->getId();
        }, $clientSideVideoCodePrototypes);

        return $clientSideVideoCodePrototypeIds;
    }
}
