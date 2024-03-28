<?php

namespace App\Account\Controller;

use App\Account\Form\RegistrationFormType;
use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Account\UserRepository;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class RegistrationController extends AbstractController
{
    public function __construct(
        private readonly EmailVerifier $emailVerifier,
        private readonly TranslatorInterface $translator,
    )
    {
    }

    /**
     * @Route("/register", name="app_register")
     */
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
    ): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // encode the plain password
            $user->setPassword(
                $userPasswordHasher->hashPassword(
                    $user,
                    $form->get('plainPassword')->getData()
                )
            );
            // new users are ROLE::STUDENT by default
            $user->setIsStudent(true);

            $eventStore->addEvent('UserRegistered', [
                'userId' => $user->getId(),
                'method' => 'RegistrationForm',
            ]);

            $entityManager->persist($user);
            $entityManager->flush();

            $this->sendConfirmationEmail($user);

            $this->addFlash(
                'success',
                $this->translator->trans('flash-message.registration.success', [], 'user-registration')
            );
            return $this->redirectToRoute('app');
        }

        return $this->render('Registration/Register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }

    private function sendConfirmationEmail(User $user): void
    {
        // generate a signed url and email it to the user
        $this->emailVerifier->sendEmailConfirmation(
            'app_verify_email',
            $user,
            (new TemplatedEmail())
                ->to($user->getEmail())
                ->subject($this->translator->trans('email.subject', [], 'user-registration'))
                ->htmlTemplate('Registration/confirmation_email.html.twig')
        );
    }

    /**
     * @Route("/verify", name="app_verify_email")
     */
    public function verifyUserEmail(
        Request $request,
        UserRepository $userRepository,
        LoggerInterface $logger,
    ): Response
    {
        $user = $userRepository->find($request->get('id'));

        try {
            if (!$user) {
                $id = $request->get('id');
                throw new \Exception("User with '$id' not found!");
            }

            // validate email confirmation link, sets User::isVerified = true
            $this->emailVerifier->handleEmailConfirmation($request, $user);

            $this->addFlash(
                'success',
                $this->translator->trans('flash-message.email-confirmation.success', [], 'user-registration')
            );
            return $this->redirectToRoute('app');

        } catch (VerifyEmailExceptionInterface|\Exception $e) {
            // Show generic error
            $this->addFlash(
                'danger',
                $this->translator->trans('flash-message.email-confirmation.error', [], 'user-registration')
            );

            // Log exact error
            $logger->error('Email verification failed!', $e->getReason() ?? $e->getMessage());

            return $this->redirectToRoute('app');
        }
    }

    /**
     * @isGranted("ROLE_USER")
     * @Route("/verify-email", name="app_verify_email_pending")
     */
    public function verifyUserEmailPending(): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->isVerified()) {
            return $this->redirectToRoute('exercise-overview');
        }

        return $this->render('Security/VerifyEmail.html.twig');
    }

    /**
     * @isGranted("ROLE_USER")
     * @Route("/verify-email-resend", name="app_resend-verification-email")
     */
    public function resendVerificationEmail(): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->isVerified()) {
            return $this->redirectToRoute('exercise-overview');
        }

        $this->sendConfirmationEmail($user);

        $this->addFlash(
            'success',
            $this->translator->trans('flash-message.email-confirmation.resend', [], 'user-registration')
        );

        return $this->redirectToRoute('app');
    }
}
