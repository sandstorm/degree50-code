<?php

namespace App\Controller\Exercise;

use App\Entity\Exercise\Exercise;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_USER")
 */
class ExerciseOverviewController extends AbstractController
{
    /**
     * @Route("/exercise-overview/", name="app_exercise-overview")
     */
    public function index(): Response
    {
        $sidebarItems = [
            '2020' => ['label' => '2020', 'items' => [
                'Seminar 1', 'Seminar 2', 'Seminar 3'
            ]],
            '2019' => ['label' => '2019', 'items' => [
                'Seminar 1', 'Seminar 2', 'Seminar 3'
            ]]
        ];

        return $this->render('ExerciseOverview/Index.html.twig', [
            'sidebarItems' => $sidebarItems
        ]);
    }
}
