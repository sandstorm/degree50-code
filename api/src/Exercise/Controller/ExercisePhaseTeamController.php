<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\LiveSync\LiveSyncService;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\VideoEncoding\Message\CutlistEncodingTask;
use App\Entity\Video\Video;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExercisePhaseTeamController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private LiveSyncService $liveSyncService;
    private MessageBusInterface $messageBus;

    /**
     * ExercisePhaseTeamController constructor.
     * @param TranslatorInterface $translator
     * @param DoctrineIntegratedEventStore $eventStore
     * @param AutosavedSolutionRepository $autosavedSolutionRepository
     * @param LiveSyncService $liveSyncService
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, AutosavedSolutionRepository $autosavedSolutionRepository, LiveSyncService $liveSyncService, MessageBusInterface $messageBus)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->liveSyncService = $liveSyncService;
        $this->messageBus = $messageBus;
    }

    /**
     * @IsGranted("create", subject="exercisePhase")
     * @Route("/exercise-phase/{id}/team/new", name="exercise-overview__exercise-phase-team--new")
     */
    public function new(Request $request, ExercisePhase $exercisePhase): Response
    {
        $entityManager = $this->getDoctrine()->getManager();

        /* @var User $user */
        $user = $this->getUser();
        $exercise = $exercisePhase->getBelongsToExercise();

        $existingTeams = $exercisePhase->getTeams();
        foreach($existingTeams as $team) {
            if ($team->getCreator() === $user) {
                $this->addFlash(
                    'danger',
                    $this->translator->trans('exercisePhaseTeam.new.messages.alreadyCreatedATeam', [], 'forms')
                );
                return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercise->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
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

        $entityManager->persist($exercisePhaseTeam);
        $entityManager->flush();

        if ($exercisePhase->isGroupPhase()) {
            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhaseTeam.new.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercise->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
        } else {
            return $this->redirectToRoute('exercise-overview__exercise-phase--show', ['id' => $exercisePhase->getId(), 'team_id' => $exercisePhaseTeam->getId()]);
        }
    }

    /**
     * @IsGranted("join", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/join", name="exercise-overview__exercise-phase-team--join")
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

        return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercisePhase->getBelongsToExercise()->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
    }

    /**
     * @IsGranted("delete", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/delete", name="exercise-overview__exercise-phase-team--delete")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function delete(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        if ($exercisePhaseTeam->getSolution() || count($exercisePhaseTeam->getAutosavedSolutions()) > 0) {
            $this->addFlash(
                'danger',
                $this->translator->trans('exercisePhaseTeam.delete.messages.hasSolution', [], 'forms')
            );
            return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercisePhase->getBelongsToExercise()->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
        }

        $this->eventStore->addEvent('TeamDeleted', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($exercisePhaseTeam);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhaseTeam.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercisePhase->getBelongsToExercise()->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
    }

    /**
     * @IsGranted("leave", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/leave", name="exercise-overview__exercise-phase-team--leave")
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
        return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercisePhase->getBelongsToExercise()->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
    }

    /**
     * @Route("/exercise-phase/share-result/{id}", name="exercise-overview__exercise-phase-team--share-result")
     */
    public function shareResult(ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $entityManager = $this->getDoctrine()->getManager();

        $solution = $exercisePhaseTeam->getSolution();
        $solution->setTeam($exercisePhaseTeam);

        // use solution of the latest autosaved one
        $latestAutosavedSolution = $this->autosavedSolutionRepository->findOneBy(['team' => $exercisePhaseTeam], ['update_timestamp' => 'desc']);
        if ($latestAutosavedSolution) {
            $solution->setSolution($latestAutosavedSolution->getSolution());
            $solution->setUpdateTimestamp($latestAutosavedSolution->getUpdateTimestamp());
        }

        // remove autosaved solutions
        $autosavedSolutions = $exercisePhaseTeam->getAutosavedSolutions();
        foreach ($autosavedSolutions as $autosavedSolution) {
            $entityManager->remove($autosavedSolution);
        }

        $exercisePhase = $exercisePhaseTeam->getExercisePhase();
        $this->eventStore->addEvent('SolutionShared', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'solutionId' => $solution->getId()
        ]);

        $entityManager->persist($solution);
        $entityManager->flush();

        $this->dispatchCutlistEncodingTask($exercisePhaseTeam, $entityManager);

        return $this->redirectToRoute('exercise-overview__exercise--show', ['id' => $exercisePhase->getBelongsToExercise()->getId(), 'phaseIndex' => $exercisePhase->getSorting()]);
    }

    private function dispatchCutlistEncodingTask(ExercisePhaseTeam $exercisePhaseTeam, EntityManagerInterface $entityManager) {
        $exercisePhase = $exercisePhaseTeam->getExercisePhase();

        if (!$exercisePhase instanceof VideoAnalysis) {
            return;
        }

        $solution = $exercisePhaseTeam->getSolution()->getSolution();
        $cutlist= $solution['cutlist'];

        if (empty($cutlist)) {
            return;
        }

        $cutlistVideo = $this->createVideo($entityManager, $exercisePhaseTeam->getCreator());
        $this->messageBus->dispatch(new CutlistEncodingTask($exercisePhaseTeam, $cutlistVideo->getId()));
    }

    private function createVideo(EntityManagerInterface $entityManager, User $creator): ?Video {
        $videoUuid = Uuid::uuid4()->toString();
        $video = new Video($videoUuid);
        $video->setCreator($creator);

        $video->setTitle('Video to be cut <' . $videoUuid . '>');
        $video->setDataPrivacyAccepted(true);
        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager->persist($video);
        $entityManager->flush();

        return $video;
    }


    /**
     * Try to create a new AutosaveSolution and then publish the most recent version of the solution.
     *
     * @IsGranted("updateSolution", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/update-solution/{id}", name="exercise-overview__exercise-phase-team--update-solution")
     */
    public function updateSolution(Request $request, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();
        $response = null;
        $solutionFromJson = json_decode($request->getContent(), true);

        // If current user is not current editor && there is a solution -> discard
        if ($user === $exercisePhaseTeam->getCurrentEditor()) {
            $autosaveSolution = new AutosavedSolution();
            $autosaveSolution->setTeam($exercisePhaseTeam);
            $autosaveSolution->setSolution($solutionFromJson['solution']);
            $autosaveSolution->setOwner($user);

            $this->eventStore->disableEventPublishingForNextFlush();
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($autosaveSolution);
            $entityManager->flush();

            $response = Response::create('OK');
        } else {
            $response = Response::create('Not editor!', Response::HTTP_FORBIDDEN);
        }

        // Why: send solution even if the user was not allowed to
        // This will reset the state in the client to the actual state

        $solution = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

        // push solution to clients
        $this->liveSyncService->publish($exercisePhaseTeam, ['solution' => $solution, 'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId()]);

        return $response;
    }

    /**
     * Try to update the currentEditor of the TeamPhase and then publish the most recent solution
     *
     * @IsGranted("updateSolution", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/update-current-editor/{id}", name="exercise-overview__exercise-phase-team--update-current-editor")
     */
    public function updateCurrentEditor(Request $request, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $user = $this->getUser();
        // get teamMember with the candidate id
        $currentEditorCandidateIdFromJson = json_decode($request->getContent(), true)['currentEditorCandidateId'];
        $currentEditorCandidate = $exercisePhaseTeam->getMembers()->filter(function (User $member) use ($currentEditorCandidateIdFromJson) {
            return $member->getId() === $currentEditorCandidateIdFromJson;
        })->first();

        if ($currentEditorCandidate) {
            $isAlreadySet = $currentEditorCandidate === $exercisePhaseTeam->getCurrentEditor();
            $userIsCandidate = $currentEditorCandidate === $user;
            $userIsCurrentEditor = $user === $exercisePhaseTeam->getCurrentEditor();

            // let only future currentEditor make the change
            if (!$isAlreadySet && ($userIsCandidate || $userIsCurrentEditor)) {
                $exercisePhaseTeam->setCurrentEditor($currentEditorCandidate);
                // Why: We do not need the event info about the currentEditor
                $this->eventStore->disableEventPublishingForNextFlush();
                $entityManager = $this->getDoctrine()->getManager();
                $entityManager->persist($exercisePhaseTeam);
                $entityManager->flush();

                $solution = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

                // push new state to clients
                $this->liveSyncService->publish($exercisePhaseTeam, ['solution' => $solution, 'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId()]);
                return Response::create('OK');
            } else {
                return Response::create('Not updated!', Response::HTTP_NOT_MODIFIED);
            }
        } else {
            return Response::create('currentEditor candidate is not member of exercisePhaseTeam!', Response::HTTP_FORBIDDEN);
        }
    }
}
