<?php


namespace App\EventStore;


use App\EventStore\Dto\WritableEvent;
use App\EventStore\Dto\WritableEvents;
use App\EventStore\Storage\EventStorageInterface;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;
use Opis\JsonSchema\Schema;
use Opis\JsonSchema\ValidationError;
use Opis\JsonSchema\Validator;
use Ramsey\Uuid\Uuid;

class DoctrineIntegratedEventStore implements EventSubscriber
{
    private EventStorageInterface $eventStorage;

    private string $schemaDirectory;

    private WritableEvents $writableEvents;

    /**
     * EventStore constructor.
     * @param EventStorageInterface $eventStorage
     * @param string $schemaDirectory
     */
    public function __construct(EventStorageInterface $eventStorage, string $schemaDirectory)
    {
        $this->eventStorage = $eventStorage;
        $this->schemaDirectory = $schemaDirectory;
        $this->writableEvents = WritableEvents::fromArray([]);
    }


    public function addEvent(string $type, array $data)
    {
        $this->validate($type, $data);

        $metadata = [];

        $this->writableEvents = $this->writableEvents->append(new WritableEvent(
            Uuid::uuid4()->toString(),
            $type,
            $data,
            $metadata
        ));
    }

    private function validate(string $type, array $data): void
    {
        $schema = Schema::fromJsonString(file_get_contents($this->schemaDirectory . $type . '.json'));
        $validator = new Validator();
        $result = $validator->schemaValidation(json_decode(json_encode($data)), $schema);

        if (!$result->isValid()) {
            /** @var ValidationError $error */
            $error = $result->getFirstError();
            throw new \RuntimeException('TODO - Event Validation error ' . $error->keyword() . PHP_EOL . json_encode($error->keywordArgs(), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
        }
    }

    // callback methods must be called exactly like the events they listen to;
    // they receive an argument of type LifecycleEventArgs, which gives you access
    // to both the entity object of the event and the entity manager itself
    public function onFlush(OnFlushEventArgs $args)
    {
        $args->getEntityManager()->getConnection()->setNestTransactionsWithSavepoints(false);

        $unitOfWork = $args->getEntityManager()->getUnitOfWork();

        if (
            count($unitOfWork->getScheduledEntityInsertions()) > 0
            || count($unitOfWork->getScheduledEntityUpdates()) > 0
            || count($unitOfWork->getScheduledEntityDeletions()) > 0
            || count($unitOfWork->getScheduledCollectionDeletions()) > 0
            || count($unitOfWork->getScheduledCollectionUpdates()) > 0
        ) {
            if ($this->writableEvents->count() === 0) {
                throw new \RuntimeException('TODO: forgot to add an event!!!');
            }
        }

        $args->getEntityManager()->beginTransaction();
        try {
            $this->eventStorage->commit($this->writableEvents);
        } catch (\Throwable $e) {
            $args->getEntityManager()->rollback();
            throw $e;
        }
        $this->writableEvents = WritableEvents::fromArray([]);
    }

    public function postFlush(PostFlushEventArgs $args) {
        if ($args->getEntityManager()->getConnection()->isRollbackOnly()) {
            return;
        }
        $args->getEntityManager()->commit();

        // TODO: switch to old state
        $args->getEntityManager()->getConnection()->setNestTransactionsWithSavepoints(false);
    }


    public function getSubscribedEvents()
    {
        return [
            Events::onFlush,
            Events::postFlush,
        ];
    }
}
