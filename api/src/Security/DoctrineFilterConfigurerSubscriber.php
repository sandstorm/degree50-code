<?php


namespace App\Security;


use App\Entity\Account\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Security;

class DoctrineFilterConfigurerSubscriber implements EventSubscriberInterface
{

    private Security $security;
    private EntityManagerInterface $entityManager;

    public function __construct(Security $security, EntityManagerInterface $entityManager)
    {
        $this->security = $security;
        $this->entityManager = $entityManager;
    }


    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::REQUEST => [
                ['processRequest']
            ]
        ];
    }

    public function processRequest()
    {
        $exerciseFilter = $this->entityManager->getFilters()->enable('exercise_doctrine_filter');
        $courseFilter = $this->entityManager->getFilters()->enable('course_doctrine_filter');
        $videoFilter = $this->entityManager->getFilters()->enable('video_doctrine_filter');

        if ($user = $this->security->getUser()) {
            assert($user instanceof User);

            if ($user->isAdmin()) {
                $this->entityManager->getFilters()->disable('course_doctrine_filter');
                $this->entityManager->getFilters()->disable('exercise_doctrine_filter');
            }

            $exerciseFilter->setParameter('userId', $user->getId());
            $courseFilter->setParameter('userId', $user->getId());
            $videoFilter->setParameter('userId', $user->getId());
        }
    }
}
