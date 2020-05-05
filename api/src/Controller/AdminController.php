<?php

namespace App\Controller;

use EasyCorp\Bundle\EasyAdminBundle\Controller\EasyAdminController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class AdminController extends EasyAdminController
{
    public function runAction()
    {

        $easyadmin = $this->request->attributes->get('easyadmin');
        /* @var $entity \App\Entity\Exercise\Exercise */
        $entity = $easyadmin['item'];
        return $this->redirectToRoute('app_exercise', ['id' => $entity->getId()]);
    }
}
