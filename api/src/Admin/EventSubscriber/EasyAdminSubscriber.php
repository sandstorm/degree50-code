<?php

namespace App\Admin\EventSubscriber;

use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityDeletedEvent;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityPersistedEvent;
use EasyCorp\Bundle\EasyAdminBundle\Event\BeforeEntityUpdatedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class EasyAdminSubscriber implements EventSubscriberInterface
{
    private UserPasswordEncoderInterface $passwordEncoder;
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * EasyAdminSubscriber constructor.
     * @param DoctrineIntegratedEventStore $eventStore
     */
    public function __construct(DoctrineIntegratedEventStore $eventStore, UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->eventStore = $eventStore;
        $this->passwordEncoder = $passwordEncoder;
    }

    public static function getSubscribedEvents()
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
            $entity->setPassword($this->passwordEncoder->encodePassword($entity, $entity->getPlainPassword()));
        }
    }
}
