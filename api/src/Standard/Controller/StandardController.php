<?php

namespace App\Standard\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class StandardController extends AbstractController
{
    /**
     * @Route("/impressum", name="app_imprint")
     */
    public function imprint(): Response
    {
        return $this->render('Standard/Imprint.html.twig');
    }

    /**
     * @Route("/datenschutz", name="app_data-privacy")
     */
    public function dataPrivacy(): Response
    {
        return $this->render('Standard/DataPrivacy.html.twig');
    }
}
