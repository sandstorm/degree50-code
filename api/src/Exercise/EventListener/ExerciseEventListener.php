<?php

namespace App\Exercise\EventListener;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Security\Core\Security;

class ExerciseEventListener
{
    private Security $security;

    public function __construct(Security $security)
    {
        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }


    /**
     * Sets the current user as creator to every exercise created
     * FIXME this is magic from the point of view of someone seeing the
     * exercise creation code, because there is no direct connection to this code.
     * We should probably remove this!!!
     *
     * @param Exercise $exercise
     * @param LifecycleEventArgs $event
     */
    public function prePersist(Exercise $exercise, LifecycleEventArgs $event)
    {
        /** @var User $currentUser */
        $currentUser = $this->security->getUser();
        if ($currentUser instanceof User) {
            $exercise->setCreator($currentUser);
        }
    }
}
