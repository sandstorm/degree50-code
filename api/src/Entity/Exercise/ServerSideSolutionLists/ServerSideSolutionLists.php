<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

/**
 * Server side represenation of solutionLists.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideSolutionLists {
    /**
     * @var ServerSideAnnotation[]
     */
    private array $serverSideAnnotations;

    /**
     * @var ServerSideVideoCode[]
     */
    private array $serverSideVideoCodes;

    /**
     * @var ServerSideCut[]
     */
    private array $serverSideCutList;

    /**
     * @var ServerSideVideoCodePrototype[]
     */
    private array $serverSideVideoCodePrototypes;

    private function __construct(array $serverSideAnnotations, array $serverSideVideoCodes, array $serverSideCutList, array $serverSideVideoCodePrototypes)
    {
        foreach ($serverSideAnnotations as $annotation) {
            assert($annotation instanceof ServerSideAnnotation);
        }

        foreach($serverSideVideoCodes as $videoCode) {
            assert($videoCode instanceof ServerSideVideoCode);
        }

        foreach($serverSideCutList as $cut) {
            assert($cut instanceof ServerSideCut);
        }

        foreach($serverSideVideoCodePrototypes as $videoCodePrototype) {
            assert($videoCodePrototype instanceof ServerSideVideoCodePrototype);
        }

        $this->serverSideAnnotations = $serverSideAnnotations;
        $this->serverSideVideoCodes = $serverSideVideoCodes;
        $this->serverSideCutList = $serverSideCutList;
        $this->serverSideVideoCodePrototypes = $serverSideVideoCodePrototypes;
    }

    public static function fromArray(array $input): ServerSideSolutionLists {
        $serverSideAnnotations = array_map(function ($annotation) {
            return ServerSideAnnotation::fromArray($annotation);
        }, $input['annotations']);

        $serverSideVideoCodes = array_map(function ($videoCode) {
            return ServerSideVideoCode::fromArray($videoCode);
        }, $input['videoCodes']);

        $serverSideCutList = array_map(function ($cut) {
            return ServerSideCut::fromArray($cut);
        }, $input['cutList']);

        // NOTE:
        // Prototypes have been saved under the name 'customVideoCodesPool' as JSON before.
        // We need to stay compatible with already persisted solutions.
        // That's where the naming missmatch is coming from!
        $serverSideVideoCodePrototypes = [];
        if (!empty($input['customVideoCodesPool'])) {
            $serverSideVideoCodePrototypes = array_map(function ($videoCodePrototype) {
                return ServerSideVideoCodePrototype::fromArray($videoCodePrototype);
            }, $input['customVideoCodesPool']);
        }

        return new self(
            $serverSideAnnotations,
            $serverSideVideoCodes,
            $serverSideCutList,
            $serverSideVideoCodePrototypes
        );
    }

    public static function fromClientJSON(array $input): self {
        $serverSideAnnotations = array_map(function ($annotation) {
            return ServerSideAnnotation::fromArray($annotation);
        }, $input['annotations']);

        $serverSideVideoCodes = array_map(function ($videoCode) {
            return ServerSideVideoCode::fromArray($videoCode);
        }, $input['videoCodes']);

        $serverSideCutList = array_map(function ($cut) {
            return ServerSideCut::fromArray($cut);
        }, $input['cutList']);

        $serverSideVideoCodePrototypes = [];
        if (!empty($input['videoCodePrototypes'])) {
            $serverSideVideoCodePrototypes = array_map(function ($videoCodePrototype) {
                return ServerSideVideoCodePrototype::fromArray($videoCodePrototype);
            }, $input['videoCodePrototypes']);
        }

        return new self(
            $serverSideAnnotations,
            $serverSideVideoCodes,
            $serverSideCutList,
            $serverSideVideoCodePrototypes
        );
    }

    public function toArray(): array {
        $annotations = array_map(function (ServerSideAnnotation $annotation) {
            return $annotation->toArray();
        }, $this->serverSideAnnotations);

        $videoCodes = array_map(function (ServerSideVideoCode $videoCode) {
            return $videoCode->toArray();
        }, $this->serverSideVideoCodes);

        $cutList = array_map(function (ServerSideCut $cut) {
            return $cut->toArray();
        }, $this->serverSideCutList);

        $videoCodePrototypes = array_map(function (ServerSideVideoCodePrototype $videoCodePrototype) {
            return $videoCodePrototype->toArray();
        }, $this->serverSideVideoCodePrototypes);

        // Why 'customVideoCodesPool' instead of 'videoCodeProtoypes'? -> see fromArray()-method for explaination
        return [
            'annotations' => $annotations,
            'videoCodes' => $videoCodes,
            'cutList' => $cutList,
            'customVideoCodesPool' => $videoCodePrototypes,
        ];
    }

    public function getAnnotations() {
        return $this->serverSideAnnotations;
    }

    public function getVideoCodes() {
        return $this->serverSideVideoCodes;
    }

    public function getCutList() {
        return $this->serverSideCutList;
    }

    /**
     * Get videoCodePrototypes.
     */
    public function getVideoCodePrototypes()
    {
        return $this->serverSideVideoCodePrototypes;
    }
}
