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
    public function __construct(
        private readonly string $identifier,
        private readonly string $type,
        private readonly array  $payload,
        private readonly array  $metadata
    )
    {
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
