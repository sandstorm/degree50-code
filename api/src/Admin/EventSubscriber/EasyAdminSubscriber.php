<?php

namespace App\Admin\EventSubscriber;

use App\EventStore\DoctrineIntegratedEventStore;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityPersistedEvent;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityUpdatedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class EasyAdminSubscriber implements EventSubscriberInterface
{
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * EasyAdminSubscriber constructor.
     * @param DoctrineIntegratedEventStore $eventStore
     */
    public function __construct(DoctrineIntegratedEventStore $eventStore)
    {
        $this->eventStore = $eventStore;
    }

    public static function getSubscribedEvents()
    {
        return [
            BeforeEntityPersistedEvent::class => ['disableEventPublishingForNextFlush'],
            BeforeEntityUpdatedEvent::class => ['disableEventPublishingForNextFlush'],
        ];
    }

    public function disableEventPublishingForNextFlush()
    {
        $this->eventStore->disableEventPublishingForNextFlush();
    }
}
