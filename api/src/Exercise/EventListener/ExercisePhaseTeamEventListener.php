<?php

namespace App\Exercise\EventListener;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Security\Core\Security;

class ExercisePhaseTeamEventListener
{
    private Security $security;

    public function __construct(Security $security)
    {
        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }

    // FIXME
    // This magic has catched us off guard multiple times
    // The creator should instead always be set explicitely!
    /**
     * Sets the current user as creator to every exercise created
     *
     * @param ExercisePhaseTeam $exercisePhaseTeam
     * @param LifecycleEventArgs $event
     */
    public function prePersist(ExercisePhaseTeam $exercisePhaseTeam, LifecycleEventArgs $event)
    {
        /** @var User $currentUser */
        $currentUser = $this->security->getUser();
        if ($currentUser instanceof User) {
            $exercisePhaseTeam->setCreator($currentUser);
        }
    }
}
