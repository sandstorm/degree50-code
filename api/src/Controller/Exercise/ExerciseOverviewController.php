<?php

namespace App\Controller\Exercise;

use App\Entity\Exercise\Exercise;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class ExerciseOverviewController extends AbstractController
{
    /**
     * @Route("/exercise-overview/", name="app_exercise-overview")
     */
    public function index(): Response
    {
        return $this->render('ExerciseOverview/Index.html.twig');
    }
}
