<?php
declare(strict_types=1);

namespace App\EventStore;


use App\EventStore\Dto\WritableEvent;
use App\EventStore\Dto\WritableEvents;
use App\EventStore\Exception\EventValidationException;
use App\EventStore\Exception\MissingEventException;
use App\EventStore\Storage\EventStorageInterface;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\UnitOfWork;
use Exception;
use Opis\JsonSchema\Schema;
use Opis\JsonSchema\ValidationError;
use Opis\JsonSchema\Validator;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Throwable;

/**
 * The doctrine integrated event store is an "EvenSourcing" event store which persists events together
 * with the corresponding Doctrine EntityManager flush() call.
 *
 * It ensures that whenever flush() is called, at least one event is published.
 *
 * This service is first called by userland code with the addEvent() method.
 *
 * Lateron, during an EntityManager->flush(), first the onFlush(), and then the postFlush() callback methods
 * are called. Because we cannot inject SQL statements inside the transaction created by {@see UnitOfWork::commit()}, we need
 * to wrap the transaction with an outer transaction. This is done in the following way:
 *
 *  - in flush(), we disable savepoints if enabled, as we want to ensure that the full persist call behaves as one transaction (events
 *    and ORM-managed entities)
 *  - in flush(), we validate that if the Unit of Work contains updates, we also have an event.
 *
 */
class DoctrineIntegratedEventStore implements EventSubscriber
{
    private EventStorageInterface $eventStorage;
    private LoggerInterface $logger;
    private bool $throwExceptionOnFailure;
    private string $schemaDirectory;

    private WritableEvents $writableEvents;
    private bool $reenableSavepointsAfterTransactionIsComplete;
    private bool $eventPublishingEnabledForNextFlush;

    public function __construct(EventStorageInterface $eventStorage, LoggerInterface $logger, string $schemaDirectory, bool $throwExceptionOnFailure)
    {
        $this->eventStorage = $eventStorage;
        $this->logger = $logger;
        $this->schemaDirectory = $schemaDirectory;
        $this->throwExceptionOnFailure = $throwExceptionOnFailure;

        $this->reset();
    }

    /**
     * Add an event to be published at the next ObjectManager->flush() call. Ensures that the data adheres
     *
     * @param string $type
     * @param array $payload
     */
    public function addEvent(string $type, array $payload): void
    {
        $this->ensureEventPayloadStructureAdheresToSchema($type, $payload);

        $metadata = [];

        $this->writableEvents = $this->writableEvents->append(new WritableEvent(
            Uuid::uuid4()->toString(),
            $type,
            $payload,
            $metadata
        ));
    }

    private function ensureEventPayloadStructureAdheresToSchema(string $type, array $data): void
    {
        $schemaFileName = $this->schemaDirectory . $type . '.json';

        if (!file_exists($schemaFileName)) {
            $this->throwOrLog(new EventValidationException(sprintf('The schema file "%s" for event type "%s" does not exist.', $schemaFileName, $type)));
            return;
        }
        $schema = Schema::fromJsonString(file_get_contents($schemaFileName));
        $validator = new Validator();
        $result = $validator->schemaValidation(json_decode(json_encode($data)), $schema);

        if (!$result->isValid()) {
            /** @var ValidationError $error */
            $error = $result->getFirstError();

            $this->throwOrLog(new EventValidationException(sprintf('Validation error for event %s: %s %s %s', $type, $error->keyword(), PHP_EOL, json_encode($error->keywordArgs(), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT))));
            return;
        }
    }

    public function disableEventPublishingForNextFlush(): void
    {
        $this->eventPublishingEnabledForNextFlush = false;
    }

    public function getSubscribedEvents(): array
    {
        return [
            Events::onFlush,
            Events::postFlush,
        ];
    }

    public function onFlush(OnFlushEventArgs $args)
    {
        // Here, we begin the overall transaction which is committed in postFlush().
        $args->getEntityManager()->beginTransaction();

        if ($this->eventPublishingEnabledForNextFlush === false) {
            $this->reset();
            return;
        }

        if ($this->ensureEventsArePublishedForEveryObjectModification($args->getEntityManager()->getUnitOfWork()) === false) {
            return;
        }

        if ($args->getEntityManager()->getConnection()->getNestTransactionsWithSavepoints() === true) {
            $args->getEntityManager()->getConnection()->setNestTransactionsWithSavepoints(false);
            $this->reenableSavepointsAfterTransactionIsComplete = true;
        }

        try {
            $this->eventStorage->commit($this->writableEvents);
        } catch (Throwable $e) {
            $args->getEntityManager()->rollback();
            throw $e;
        }
    }

    private function ensureEventsArePublishedForEveryObjectModification(UnitOfWork $unitOfWork): bool
    {
        if (
            count($unitOfWork->getScheduledEntityInsertions()) > 0
            || count($unitOfWork->getScheduledEntityUpdates()) > 0
            || count($unitOfWork->getScheduledEntityDeletions()) > 0
            || count($unitOfWork->getScheduledCollectionDeletions()) > 0
            || count($unitOfWork->getScheduledCollectionUpdates()) > 0
        ) {
            if ($this->writableEvents->count() === 0) {
                $this->throwOrLog(new MissingEventException('You called EntityManager->flush(), but did not add any event using DoctrineIntegratedEventStore->addEvent(). Either add an event or call DoctrineIntegratedEventStore->disableEventPublishingForNextFlush()'));
                return false;
            }
        }
        return true;
    }

    public function postFlush(PostFlushEventArgs $args)
    {
        if ($args->getEntityManager()->getConnection()->isRollbackOnly()) {
            // If the connection is rollbackOnly, this means an inner transaction (i.e. the one from UnitOfWork) has failed.
            // Thus, we abort the outer transaction as well.
            $args->getEntityManager()->rollback();
        } else {
            // let's try to commit EVERYTHING (i.e. the ORM state changes, as well as the Events
            $args->getEntityManager()->commit();
        }

        if ($this->reenableSavepointsAfterTransactionIsComplete) {
            $args->getEntityManager()->getConnection()->setNestTransactionsWithSavepoints(true);
        }

        // finally, reset the internal state
        $this->reset();
    }


    private function reset()
    {
        $this->writableEvents = WritableEvents::fromArray([]);
        $this->reenableSavepointsAfterTransactionIsComplete = false;
        $this->eventPublishingEnabledForNextFlush = true;
    }

    private function throwOrLog(Exception $exception): void
    {
        if ($this->throwExceptionOnFailure) {
            throw $exception;
        } else {
            $this->logger->error($exception->getMessage());
        }
    }
}
