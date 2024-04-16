<?php

namespace App\EventStore\Storage\Doctrine;

use App\EventStore\Dto\WritableEvent;
use App\EventStore\Dto\WritableEvents;
use App\EventStore\Storage\EventStorageInterface;
use DateTimeImmutable;
use Doctrine\DBAL\Driver\Connection;
use Doctrine\DBAL\Schema\Comparator;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\SchemaConfig;
use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Types\Types;
use Throwable;

/**
 * Database event storage adapter
 */
class DoctrineEventStorage implements EventStorageInterface
{
    const DEFAULT_EVENT_TABLE_NAME = 'eventstore_events';

    private string $eventTableName;

    public function __construct(
        private readonly Connection $connection,
        private readonly array      $options // is required for the setup method
    )
    {
        $this->eventTableName = $options['eventTableName'] ?? self::DEFAULT_EVENT_TABLE_NAME;
    }

    /**
     * @inheritdoc
     * @throws \Exception | ConcurrencyException | Throwable
     */
    public function commit(WritableEvents $events): void
    {
        try {
            foreach ($events as $event) {
                $this->commitEvent($event);
            }
        } catch (Throwable $exception) {
            throw $exception;
        }
    }

    /**
     * @param WritableEvent $event
     * @throws \Exception | UniqueConstraintViolationException
     */
    private function commitEvent(WritableEvent $event): void
    {
        $metadata = $event->getMetadata();
        $this->connection->insert(
            $this->eventTableName,
            [
                'id' => $event->getIdentifier(),
                'type' => $event->getType(),
                'payload' => json_encode($event->getPayload(), JSON_PRETTY_PRINT),
                'metadata' => json_encode($metadata, JSON_PRETTY_PRINT),
                'recordedat' => new DateTimeImmutable()
            ],
            [
                'recordedat' => Types::DATETIME_IMMUTABLE,
            ]
        );
    }

    /**
     * @inheritdoc
     * @throws \Exception | Throwable
     */
    public function setup(): string
    {
        $fromSchema = $this->connection->getSchemaManager()->createSchema();
        $schemaDiff = (new Comparator())->compare($fromSchema, $this->createEventStoreSchema());

        $statements = $schemaDiff->toSaveSql($this->connection->getDatabasePlatform());
        if ($statements === []) {
            return "";
        }
        $this->connection->beginTransaction();
        try {
            foreach ($statements as $statement) {
                $this->connection->exec($statement);
            }
            $this->connection->commit();
        } catch (Throwable $exception) {
            $this->connection->rollBack();
            throw $exception;
        }
        return "";
    }

    /**
     * Creates the Doctrine schema to be compared with the current db schema for migration
     *
     * @return Schema
     */
    private function createEventStoreSchema(): Schema
    {
        $schemaConfiguration = new SchemaConfig();
        $schema = new Schema([], [], $schemaConfiguration);
        $table = $schema->createTable($this->eventTableName);

        // The monotonic sequence number
        $table->addColumn('sequencenumber', Type::INTEGER, ['autoincrement' => true]);
        // The event type in the format "<BoundedContext>:<EventType>"
        $table->addColumn('type', Types::STRING, ['length' => 255]);
        // The event payload as JSON
        $table->addColumn('payload', Types::JSON);
        // The event metadata as JSON
        $table->addColumn('metadata', Types::JSON);
        // The unique event id, usually a UUID
        $table->addColumn('id', Types::STRING, ['length' => 255]);
        // Timestamp of the the event publishing
        $table->addColumn('recordedat', Types::DATETIME_IMMUTABLE);

        $table->setPrimaryKey(['sequencenumber']);
        $table->addUniqueIndex(['id'], 'id_uniq');

        return $schema;
    }

    /**
     * Reconnects the database connection associated with this storage, if it doesn't respond to a ping
     *
     * @return void
     * @see \Neos\Flow\Persistence\Doctrine\PersistenceManager::persistAll()
     */
    private function reconnectDatabaseConnection(): void
    {
        if ($this->connection->ping() === false) {
            $this->connection->close();
            $this->connection->connect();
        }
    }
}
