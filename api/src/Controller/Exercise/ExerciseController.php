<?php

namespace App\Controller\Exercise;

use App\Entity\Exercise\Exercise;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class ExerciseController extends AbstractController
{
    /**
     * @Route("/exercise/{id}/{phase<\d+>}", name="app_exercise")
     */
    public function show(Exercise $exercise, int $phase = 0): Response
    {
        $firstPhase = $exercise->getPhases()->get($phase);

        return $this->render('exercise/show.html.twig',
            [
                'exercise' => $exercise,
                'phase' => $firstPhase,
                'currentPhase' => $phase,
                'amountOfPhases' => count($exercise->getPhases()) - 1
            ]);
    }

    /**
     * @Route("/logout", name="app_logout")
     */
    public function logout()
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
