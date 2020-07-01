<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\Solution;
use App\EventStore\DoctrineIntegratedEventStore;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
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
     * @IsGranted("create", subject="exercisePhase")
     * @Route("/exercise-phase/{id}/team/new", name="app_exercise-phase-team-new")
     */
    public function new(Request $request, ExercisePhase $exercisePhase): Response
    {
        $entityManager = $this->getDoctrine()->getManager();

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

        $solution = new Solution();
        $solution->setTeam($exercisePhaseTeam);
        $solution->setSolution(null);

        $entityManager->persist($solution);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);


        $entityManager->persist($exercisePhaseTeam);

        $entityManager->flush();

        if ($exercisePhase->isGroupPhase()) {
            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhaseTeam.new.messages.success', [], 'forms')
            );

            // TODO change route from int to id of phase
            return $this->redirectToRoute('app_exercise', ['id' => $exercise->getId(), 'phase' => $exercisePhase->getSorting()]);
        } else {
            return $this->redirectToRoute('app_exercise-phase-show', ['id' => $exercisePhase->getId(), 'team_id' => $exercisePhaseTeam->getId()]);
        }
    }

    /**
     * @IsGranted("join", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/join", name="app_exercise-phase-team-join")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function join(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

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
            $this->translator->trans('exercisePhaseTeam.join.messages.success', [], 'forms')
        );

        // TODO change route from int to id of phase
        return $this->redirectToRoute('app_exercise', ['id' => $exercisePhase->getBelongsToExcercise()->getId(), 'phase' => $exercisePhase->getSorting()]);

    }

    /**
     * @Route("/exercise-phase/{id}/team/{team_id}/leave", name="app_exercise-phase-team-leave")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function leave(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        $exercisePhaseTeam->removeMember($user);

        $this->eventStore->addEvent('MemberRemovedFromTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($exercisePhaseTeam);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhaseTeam.leave.messages.success', [], 'forms')
        );

        // TODO change route from int to id of phase
        return $this->redirectToRoute('app_exercise', ['id' => $exercisePhase->getBelongsToExcercise()->getId(), 'phase' => $exercisePhase->getSorting()]);

    }

}
