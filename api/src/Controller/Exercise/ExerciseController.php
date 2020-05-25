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
class ExerciseController extends AbstractController
{
    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/{id}/{phase<\d+>}", name="app_exercise")
     */
    public function show(Exercise $exercise, int $phase = 0): Response
    {
        return $this->render('Exercise/Show.html.twig',
            [
                'exercise' => $exercise,
                'phase' => $exercise->getPhases()->get($phase),
                'currentPhase' => $phase,
                'amountOfPhases' => count($exercise->getPhases()) - 1
            ]);
    }
}
