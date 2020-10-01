<?php

namespace App\Account\Controller;

use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class AuthenticationController extends AbstractController
{
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * AuthenticationController constructor.
     * @param DoctrineIntegratedEventStore $eventStore
     */
    public function __construct(DoctrineIntegratedEventStore $eventStore)
    {
        $this->eventStore = $eventStore;
    }

    /**
     * @Route("/login", name="app_login")
     */
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('Security/Login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    /**
     * NOTE: This route must match security.yaml at path `security.firewalls.main.logout.path`
     *
     * DO NOT TOUCH; the SAML IDP calls /saml/logout (as the URL is part of the public SAML API at https://degree40.tu-dortmund.de/saml/metadata)
     *
     * @Route("/saml/logout", name="app_logout")
     */
    public function logout()
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    /**
     * @Route("/user/data-privacy", name="app_data-privacy")
     */
    public function dataPrivacy(Request $request): Response
    {
        $accepted = !!$request->query->get('accepted', false);
        /* @var User $user */
        $user = $this->getUser();

        if ($accepted) {
            $this->eventStore->addEvent('DataPrivacyAccepted', [
                'userId' => $user->getId(),
            ]);

            $user->setDataPrivacyAccepted(true);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->redirectToRoute('exercise-overview');
        }

        return $this->render('Security/DataPrivacy.html.twig');
    }
}
