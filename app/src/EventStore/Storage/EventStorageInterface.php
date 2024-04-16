<?php
declare(strict_types=1);

namespace App\EventStore\Storage;

use App\EventStore\Dto\WritableEvents;

/**
 * Contract for Event Storage adapters
 */
interface EventStorageInterface
{
    /**
     * @param WritableEvents $events
     * @return void
     */
    public function commit(WritableEvents $events): void;

    /**
     * Sets up the configured storage adapter (i.e. creates required database tables) and validates the configuration
     *
     * If the result contains no errors, the setup is considered successful
     * The result may contain Notices, Warnings and Errors
     *
     * @return string
     */
    public function setup(): string;
}
