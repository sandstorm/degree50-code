<?php


namespace App\EventStore\Storage\Doctrine;


use App\EventStore\Dto\WritableEvent;
use App\EventStore\Dto\WritableEvents;
use App\EventStore\Storage\EventStorageInterface;
use Doctrine\DBAL\Driver\Connection;
use Doctrine\DBAL\Schema\Comparator;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\SchemaConfig;
use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Types\Types;

/**
 * Database event storage adapter
 */
class DoctrineEventStorage implements EventStorageInterface
{
    const DEFAULT_EVENT_TABLE_NAME = 'eventstore_events';

    /**
     * @var Connection
     */
    private $connection;

    /**
     * @var string
     */
    private $eventTableName;

    /**
     * @var array
     */
    private $options;

    /**
     * @param array $options
     */
    public function __construct(Connection $connection, array $options)
    {
        $this->options = $options;
        $this->eventTableName = $options['eventTableName'] ?? self::DEFAULT_EVENT_TABLE_NAME;
        $this->connection = $connection;
    }

    /**
     * @inheritdoc
     * @throws DBALException | ConcurrencyException | \Throwable
     */
    public function commit(WritableEvents $events): void
    {
        try {
            foreach ($events as $event) {
                $this->commitEvent($event);
            }
        } catch (\Throwable $exception) {
            throw $exception;
        }
    }

    /**
     * @param WritableEvent $event
     * @param int $version
     * @throws DBALException | UniqueConstraintViolationException
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
                'recordedat' => new \DateTimeImmutable()
            ],
            [
                'recordedat' => Types::DATETIME_IMMUTABLE,
            ]
        );
    }

    /**
     * @inheritdoc
     * @throws DBALException | \Throwable
     */
    public function setup(): string
    {
        $tableExists = $this->connection->getSchemaManager()->tablesExist([$this->eventTableName]);

        if ($tableExists) {
            //$result->addNotice(new Notice('Table "%s" (already exists)', null, [$this->eventTableName]));
        } else {
            //$result->addNotice(new Notice('Creating database table "%s" in database "%s" on host %s....', null, [$this->eventTableName, $this->connection->getDatabase(), $this->connection->getHost()]));
        }

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
        } catch (\Throwable $exception) {
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
        $connectionParameters = $this->connection->getParams();
        if (isset($connectionParameters['defaultTableOptions'])) {
            //$schemaConfiguration->setDefaultTableOptions($connectionParameters['defaultTableOptions']);
        }
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
