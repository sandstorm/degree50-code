<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use JsonSerializable;

/**
 * Client side represenation of a solutionLists.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideSolutionLists implements JsonSerializable {
    /**
     * @var string[]
     */
    private array $annotationIds;

    /**
     * @var string[]
     */
    private array $videoCodeIds;

    /**
     * @var string[]
     */
    private array $cutIds;

    /**
     * @var string[]
     */
    private array $videoCodePrototypeIds;

    private function __construct(
        array $annotationIds,
        array $videoCodeIds,
        array $cutIds,
        array $videoCodePrototypeIds
    )
    {
        foreach ($annotationIds as $annotationId) {
            assert(is_string($annotationId));
        }

        foreach($videoCodeIds as $videoCodeId) {
            assert(is_string($videoCodeId));
        }

        foreach($cutIds as $cutId) {
            assert(is_string($cutId));
        }

        foreach($videoCodePrototypeIds as $videoCodePrototypeId) {
            assert(is_string($videoCodePrototypeId));
        }

        $this->annotationIds = $annotationIds;
        $this->videoCodeIds = $videoCodeIds;
        $this->cutIds = $cutIds;
        $this->videoCodePrototypeIds = $videoCodePrototypeIds;
    }

    public static function create(
        array $annotationIds,
        array $videoCodeIds,
        array $cutIds,
        array $videoCodePrototypeIds
    ) {
        return new self(
            $annotationIds,
            $videoCodeIds,
            $cutIds,
            $videoCodePrototypeIds
        );
    }

    public function jsonSerialize() {
        return [
            'annotations' => $this->annotationIds,
            'videoCodes' => $this->videoCodeIds,
            'cutList' => $this->cutIds,
            'videoCodePrototypes' => $this->videoCodePrototypeIds,
        ];
    }

    public static function fromArray(array $input) {
        return new self(
            $input['annotations'],
            $input['videoCodes'],
            $input['cutList'],
            $input['videoCodePrototypes']
        );
    }


     /**
      * Get annotationIds.
      */
     public function getAnnotationIds()
     {
         return $this->annotationIds;
     }

     /**
      * Get videoCodeIds.
      */
     public function getVideoCodeIds()
     {
         return $this->videoCodeIds;
     }

     /**
      * Get cutIds.
      */
     public function getCutIds()
     {
         return $this->cutIds;
     }

     /**
      * Get videoCodePrototypeIds.
      */
     public function getVideoCodePrototypeIds()
     {
         return $this->videoCodePrototypeIds;
     }
}
