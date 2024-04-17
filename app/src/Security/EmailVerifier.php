<?php

namespace App\Security;

use App\Domain\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;

class EmailVerifier
{

    public function __construct(
        private readonly VerifyEmailHelperInterface $verifyEmailHelper,
        private readonly MailerInterface $mailer,
        private readonly EntityManagerInterface $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly TranslatorInterface $translator,
    )
    {
    }

    public function sendEmailConfirmation(
        string $verifyEmailRouteName,
        User $user,
        TemplatedEmail $email
    ): void
    {
        $signatureComponents = $this->verifyEmailHelper->generateSignature(
            $verifyEmailRouteName,
            $user->getId(),
            $user->getEmail(),
            ['id' => $user->getId()]
        );

        $context = $email->getContext();
        $context['signedUrl'] = $signatureComponents->getSignedUrl();
        $context['expireTime'] = $this->translator->trans(
            $signatureComponents->getExpirationMessageKey(),
            $signatureComponents->getExpirationMessageData(),
            'VerifyEmailBundle'
        );

        $email->context($context);

        $this->mailer->send($email);
    }

    /**
     * @throws VerifyEmailExceptionInterface
     */
    public function handleEmailConfirmation(Request $request, User $user): void
    {
        $this->verifyEmailHelper->validateEmailConfirmation($request->getUri(), $user->getId(), $user->getEmail());

        $user->setIsVerified(true);

        $this->entityManager->persist($user);

        $this->eventStore->addEvent('UserVerified', [
            'userId' => $user->getId(),
        ]);

        $this->entityManager->flush();
    }
}
