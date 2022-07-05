<?php

namespace App\Exercise\Controller\ClientSideSolutionData;

use JsonSerializable;

/**
 * Client side representation of solution data.
 *
 * @see ClientSideSolutionDataBuilder
 **/
final class ClientSideSolutionData implements JsonSerializable
{
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

  private ?string $materialId;

  private function __construct(
    array $annotationIds,
    array $videoCodeIds,
    array $cutIds,
    array $videoCodePrototypeIds,
    ?string $materialId,
  )
  {
    foreach ($annotationIds as $annotationId) {
      assert(is_string($annotationId));
    }

    foreach ($videoCodeIds as $videoCodeId) {
      assert(is_string($videoCodeId));
    }

    foreach ($cutIds as $cutId) {
      assert(is_string($cutId));
    }

    foreach ($videoCodePrototypeIds as $videoCodePrototypeId) {
      assert(is_string($videoCodePrototypeId));
    }

    assert(is_string($materialId) || is_null($materialId));

    $this->annotationIds = $annotationIds;
    $this->videoCodeIds = $videoCodeIds;
    $this->cutIds = $cutIds;
    $this->videoCodePrototypeIds = $videoCodePrototypeIds;
    $this->materialId = $materialId;
  }

  public static function create(
    array $annotationIds,
    array $videoCodeIds,
    array $cutIds,
    array $videoCodePrototypeIds,
    ?string $materialId,
  ): ClientSideSolutionData
  {
    return new self(
      $annotationIds,
      $videoCodeIds,
      $cutIds,
      $videoCodePrototypeIds,
      $materialId
    );
  }

  public function jsonSerialize(): array
  {
    return [
      'annotations' => $this->annotationIds,
      'videoCodes' => $this->videoCodeIds,
      'cutList' => $this->cutIds,
      'videoCodePrototypes' => $this->videoCodePrototypeIds,
      'material' => $this->materialId,
    ];
  }

  public static function fromArray(array $input): ClientSideSolutionData
  {
    return new self(
      $input['annotations'],
      $input['videoCodes'],
      $input['cutList'],
      $input['videoCodePrototypes'],
      $input['material'],
    );
  }

  public function getAnnotationIds(): array
  {
    return $this->annotationIds;
  }

  public function getVideoCodeIds(): array
  {
    return $this->videoCodeIds;
  }

  public function getCutIds(): array
  {
    return $this->cutIds;
  }

  public function getVideoCodePrototypeIds(): array
  {
    return $this->videoCodePrototypeIds;
  }

  public function getMaterialId(): ?string
  {
      return $this->materialId;
  }
}
