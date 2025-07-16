<?php

namespace App\Security\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class StandardController extends AbstractController
{
    // Entry point for the application
    #[Route("/", name: "app")]
    public function index(): Response
    {
        return $this->render('Standard/Startpage.html.twig');
    }
}
