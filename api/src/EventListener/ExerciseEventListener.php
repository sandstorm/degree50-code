<?php

namespace App\EventListener;

use App\Entity\Account\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use App\Entity\Exercise\Exercise;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Security\Core\Security;

class ExerciseEventListener
{
    private Security $security;
    private UrlGeneratorInterface $router;

    public function __construct(Security $security, UrlGeneratorInterface $router)
    {
        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
        $this->router = $router;
    }


    /**
     * Sets the current user as creator to every exercise created
     *
     * @param Exercise $exercise
     * @param LifecycleEventArgs $event
     */
    public function prePersist(Exercise $exercise, LifecycleEventArgs $event)
    {
        /* @var User $currentUser */
        $currentUser = $this->security->getUser();
        $exercise->setCreator($currentUser);
    }
}