<?php
declare(strict_types=1);

namespace App\EventStore\Dto;

/*
 * This file is part of the Neos.EventSourcing package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

final class WritableEvent
{
    private string $identifier;

    private string $type;

    private array $payload;

    private array $metadata;

    public function __construct(string $identifier, string $type, array $payload, array $metadata)
    {
        $this->identifier = $identifier;
        $this->type = $type;
        $this->payload = $payload;
        $this->metadata = $metadata;
    }

    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }
}
