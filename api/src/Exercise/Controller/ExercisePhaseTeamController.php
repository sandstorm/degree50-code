<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExercisePhaseType;
use App\Entity\Exercise\Exercise;
use App\Exercise\Form\ExerciseType;
use App\Exercise\Form\VideoAnalysisType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExercisePhaseTeamController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
    }

    /**
     * @Route("/exercise-phase/{id}/team/new", name="app_exercise-phase-team-new")
     */
    public function new(Request $request, ExercisePhase $exercisePhase): Response
    {
        /* @var User $user */
        $user = $this->getUser();
        $exercise = $exercisePhase->getBelongsToExcercise();

        $existingTeams = $exercisePhase->getTeams();
        foreach($existingTeams as $team) {
            if ($team->getCreator() === $user) {
                $this->addFlash(
                    'danger',
                    $this->translator->trans('exercisePhaseTeam.new.messages.alreadyCreatedATeam', [], 'forms')
                );
                return $this->redirectToRoute('app_exercise', ['id' => $exercise->getId(), 'phase' => $exercisePhase->getSorting()]);
            }
        }

        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($user);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercisePhaseTeam);

        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhaseTeam.new.messages.success', [], 'forms')
        );

        // TODO change route from int to id of phase
        return $this->redirectToRoute('app_exercise', ['id' => $exercise->getId(), 'phase' => $exercisePhase->getSorting()]);

    }

}
