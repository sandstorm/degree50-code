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

use ArrayIterator;
use Countable;
use InvalidArgumentException;
use IteratorAggregate;

final class WritableEvents implements IteratorAggregate, Countable
{
    /**
     * @param WritableEvent[] $events
     */
    private function __construct(
        private readonly array $events
    )
    {
    }

    public static function fromArray(array $events): self
    {
        foreach ($events as $event) {
            if (!$event instanceof WritableEvent) {
                throw new InvalidArgumentException(sprintf('Only instances of WritableEvent are allowed, given: %s', is_object($event) ? get_class($event) : gettype($event)), 1540316594);
            }
        }
        return new static(array_values($events));
    }

    public function append(WritableEvent $event): self
    {
        $events = $this->events;
        $events[] = $event;
        return new static($events);
    }

    /**
     * @return WritableEvent[]|ArrayIterator<WritableEvent>
     */
    public function getIterator(): ArrayIterator
    {
        return new ArrayIterator($this->events);
    }

    public function count(): int
    {
        return count($this->events);
    }
}
