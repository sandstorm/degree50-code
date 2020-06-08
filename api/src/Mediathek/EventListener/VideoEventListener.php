<?php

namespace App\Mediathek\EventListener;

use App\Entity\Account\User;
use App\Entity\Video\Video;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Security;

class VideoEventListener
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
     * @param Video $video
     * @param LifecycleEventArgs $event
     */
    public function prePersist(Video $video, LifecycleEventArgs $event)
    {
        /* @var User $currentUser */
        $currentUser = $this->security->getUser();
        $video->setCreator($currentUser);
    }
}
