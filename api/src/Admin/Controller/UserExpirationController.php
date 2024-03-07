<?php

namespace App\Admin\Controller;

use App\Admin\Service\UserExpirationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UserExpirationController extends AbstractController
{
    private UserExpirationService $userExpirationService;

    public function __construct(UserExpirationService $userExpirationService)
    {
        $this->userExpirationService = $userExpirationService;
    }

    /**
     * @Route("/user-expiration/increase-by-a-year", name="user-expiration-increase")
     */
    public function increaseExpirationDateForUserByOneYear(Request $request): Response
    {
        $this->userExpirationService->increaseExpirationDateForUserByOneYear();

        $route = $request->headers->get('referer');

        return $this->redirect($route);
    }
}
