<?php
declare(strict_types=1);

namespace App\Security;

use App\Domain\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use Hslavich\OneloginSamlBundle\Security\Authentication\Token\SamlTokenInterface;
use Hslavich\OneloginSamlBundle\Security\User\SamlUserFactoryInterface;

/**
 * Create new users if they do not exist locally
 */
class SamlUserFactory implements SamlUserFactoryInterface
{
    public function __construct(
        private readonly DoctrineIntegratedEventStore $eventStore
    )
    {
    }

    public function createUser(SamlTokenInterface $token): User
    {
        $attributes = $token->getAttributes();

        $userIdentifier = $attributes['mail'][0];

        $user = new User();
        $user->setIsSSOUser(true);
        $user->setIsStudent(true);
        $user->setPassword('notused');
        $user->setEmail($userIdentifier);
        // SAML users are verified by default
        $user->setIsVerified(true);

        $this->eventStore->addEvent('UserRegistered', [
            'userId' => $user->getId(),
            'method' => 'SAML',
        ]);

        return $user;
    }
}
