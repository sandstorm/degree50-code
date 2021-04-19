<?php

namespace App\Entity\Exercise\ServerSideSolutionLists;

use App\Entity\Exercise\VideoCode;

/**
 * Server side representation of a videoCodePrototype.
 *
 * @see \App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder
 **/
final class ServerSideVideoCodePrototype {

    private string $id;
    private string $name;
    private string $description;
    private string $color;
    private ?string $parentId;
    private bool $userCreated;

    /**
     * @var ServerSideVideoCodePrototype[]
     */
    private array $childServerSidePrototypes;

    private function __construct(
        string $id,
        string $name,
        string $description,
        string $color,
        array $childServerSidePrototypes,
        ?string $parentId,
        bool $userCreated
    )
    {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->color = $color;
        $this->childServerSidePrototypes = $childServerSidePrototypes;
        $this->parentId = $parentId;
        $this->userCreated = $userCreated;
    }

    /**
     * Create Entity from persisted VideoCode.
     */
    public static function fromVideoCodeEntity(VideoCode $videoCodePrototype): ServerSideVideoCodePrototype
    {
        return new self(
            $videoCodePrototype->getId(),
            $videoCodePrototype->getName(),
            $videoCodePrototype->getDescription(),
            $videoCodePrototype->getColor(),
            [],
            null,
            false
        );
    }

    /**
     * Create Entity from array.
     * This is used to read from persisted and clientSide JSON.
     */
    public static function fromArray(array $input): ServerSideVideoCodePrototype
    {
        // NOTE:
        // Prototypes have been saved under the name 'videoCodes' as JSON before.
        // We need to stay compatible with already persisted solutions.
        // That's where the naming mismatch is coming from!
        $childServerSidePrototypes = array_map(function($prototype) {
            return self::fromArray($prototype);
        }, $input['videoCodes']);

        return new self(
            $input['id'],
            $input['name'],
            $input['description'],
            $input['color'],
            $childServerSidePrototypes,
            !empty($input['parentId']) ? $input['parentId'] : null,
            $input['userCreated'],
        );
    }

    /**
     * Prepare to be persisted or sent to client as JSON.
     */
    public function toArray(): array
    {
        $childPrototypes = array_map(function($prototype) {
            return $prototype->toArray();
        }, $this->childServerSidePrototypes);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'color' => $this->color,
            'videoCodes' => $childPrototypes,
            'parentId' => $this->parentId,
            'userCreated' => $this->userCreated,
        ];
    }

     /**
      * Get id.
      */
     public function getId()
     {
         return $this->id;
     }

     /**
      * Get name.
      */
     public function getName()
     {
         return $this->name;
     }

     /**
      * Get description.
      */
     public function getDescription()
     {
         return $this->description;
     }

     /**
      * Get color.
      */
     public function getColor(): string
     {
         return $this->color;
     }

     /**
      * Get parentId.
      */
     public function getParentId()
     {
         return $this->parentId;
     }

    /**
     * Get userCreated.
     */
    public function getUserCreated()
    {
        return $this->userCreated;
    }

     /**
      * Get videoCodes.
      */
     public function getChildServerSidePrototypes()
     {
         return $this->childServerSidePrototypes;
     }
}
