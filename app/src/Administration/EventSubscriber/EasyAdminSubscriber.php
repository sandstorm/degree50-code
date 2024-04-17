<?php

namespace App\Admin\EventSubscriber;

use App\Domain\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityDeletedEvent;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityPersistedEvent;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityUpdatedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class EasyAdminSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly UserPasswordHasherInterface  $userPasswordHasher
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            BeforeEntityPersistedEvent::class => [['disableEventPublishingForNextFlush'], ['encodePassword']],
            BeforeEntityUpdatedEvent::class => [['disableEventPublishingForNextFlush'], ['encodePassword']],
            BeforeEntityDeletedEvent::class => ['disableEventPublishingForNextFlush'],
        ];
    }

    public function disableEventPublishingForNextFlush()
    {
        $this->eventStore->disableEventPublishingForNextFlush();
    }

    /**
     * If the entity contained by the event is a user we encrypt its plain password
     * and write it to the user::password property.
     */
    public function encodePassword($event)
    {
        $entity = $event->getEntityInstance();
        if ($entity instanceof User && $entity->getPlainPassword()) {
            $entity->setPassword($this->userPasswordHasher->hashPassword($entity, $entity->getPlainPassword()));
        }
    }
}
