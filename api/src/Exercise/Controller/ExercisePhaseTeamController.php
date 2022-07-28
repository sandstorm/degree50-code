<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Exercise\ServerSideSolutionData\ServerSideSolutionData;
use App\Entity\Exercise\Solution;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\LiveSync\LiveSyncService;
use App\VideoEncoding\Message\CutListEncodingTask;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ExercisePhaseTeamController extends AbstractController
{
    private LoggerInterface $logger;
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private LiveSyncService $liveSyncService;
    private MessageBusInterface $messageBus;
    private SolutionService $solutionService;
    private ExercisePhaseService $exercisePhaseService;

    public function __construct(
        TranslatorInterface $translator,
        DoctrineIntegratedEventStore $eventStore,
        LiveSyncService $liveSyncService,
        MessageBusInterface $messageBus,
        SolutionService $solutionService,
        LoggerInterface $logger,
        ExercisePhaseService $exercisePhaseService,
    ) {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->liveSyncService = $liveSyncService;
        $this->messageBus = $messageBus;
        $this->solutionService = $solutionService;
        $this->logger = $logger;
        $this->exercisePhaseService = $exercisePhaseService;
    }

    /**
     * @IsGranted("createTeam", subject="exercisePhase")
     * @Route("/exercise-phase/{id}/team/new", name="exercise-overview__exercise-phase-team--new")
     */
    public function new(Request $request, ExercisePhase $exercisePhase): Response
    {
        $entityManager = $this->getDoctrine()->getManager();

        /** @var User $user */
        $user = $this->getUser();
        $exercise = $exercisePhase->getBelongsToExercise();

        $existingTeams = $exercisePhase->getTeams();
        foreach ($existingTeams as $team) {
            if ($team->getCreator() === $user) {
                $this->addFlash(
                    'danger',
                    $this->translator->trans('exercisePhaseTeam.new.messages.alreadyCreatedATeam', [], 'forms')
                );
                return $this->redirectToRoute(
                    'exercise-overview__exercise--show-phase-overview',
                    [
                        'id' => $exercise->getId(),
                        'phaseId' => $exercisePhase->getId()
                    ]
                );
            }
        }

        $exercisePhaseTeam = $this->exercisePhaseService->createPhaseTeam($exercisePhase);
        $this->exercisePhaseService->addMemberToPhaseTeam($exercisePhaseTeam, $user);

        if ($exercisePhase->isGroupPhase()) {
            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhaseTeam.new.messages.success', [], 'forms')
            );

            return $this->redirectToRoute(
                'exercise-overview__exercise--show-phase-overview',
                [
                    'id' => $exercise->getId(),
                    'phaseId' => $exercisePhase->getId()
                ]
            );
        } else {
            return $this->redirectToRoute(
                'exercise-overview__exercise-phase--show',
                [
                    'id' => $exercisePhase->getId(),
                    'team_id' => $exercisePhaseTeam->getId()
                ]
            );
        }
    }

    /**
     * @IsGranted("join", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/join", name="exercise-overview__exercise-phase-team--join")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function join(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $this->exercisePhaseService->addMemberToPhaseTeam($exercisePhaseTeam, $user);

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhaseTeam.join.messages.success', [], 'forms')
        );

        return $this->redirectToRoute(
            'exercise-overview__exercise--show-phase-overview',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @IsGranted("delete", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/delete", name="exercise-overview__exercise-phase-team--delete")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function delete(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /** @var User $user */
        $user = $this->getUser();

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

        return $this->redirectToRoute(
            'exercise-overview__exercise--show-phase-overview',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @IsGranted("leave", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/leave", name="exercise-overview__exercise-phase-team--leave")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function leave(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /** @var User $user */
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
        return $this->redirectToRoute(
            'exercise-overview__exercise--show-phase-overview',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @Route("/exercise-phase/share-result/{id}", name="exercise-overview__exercise-phase-team--share-result")
     */
    public function shareResult(ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $this->exercisePhaseService->promoteLastAutosavedSolutionToRealSolution($exercisePhaseTeam);
        $this->exercisePhaseService->cleanupAutosavedSolutions($exercisePhaseTeam);
        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);

        $this->dispatchCutListEncodingTask($exercisePhaseTeam);

        $exercisePhase = $exercisePhaseTeam->getExercisePhase();
        return $this->redirectToRoute(
            'exercise-overview__exercise--show-phase-overview',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @Route("/exercise-phase/finish-reflexion/{id}", name="exercise-overview__exercise-phase-team--finish-reflexion")
     */
    public function finishReflexion(ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        // TODO
        // We might refactor this, so that this can be part of share_result instead and we
        // no longer have the distinction inside the template (and also would not need this route anymore)
        $entityManager = $this->getDoctrine()->getManager();

        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);

        $exercisePhase = $exercisePhaseTeam->getExercisePhase();
        $this->eventStore->addEvent('ReflexionFinished', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
        ]);

        $entityManager->persist($exercisePhaseTeam);
        $entityManager->flush();

        return $this->redirectToRoute(
            'exercise-overview__exercise--show-phase-overview',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    private function dispatchCutListEncodingTask(ExercisePhaseTeam $exercisePhaseTeam)
    {
        $exercisePhase = $exercisePhaseTeam->getExercisePhase();

        if (!$exercisePhase instanceof VideoCutPhase) {
            return;
        }

        $solution = $exercisePhaseTeam->getSolution()->getSolution();
        $cutList = $solution->getCutList();

        if (empty($cutList)) {
            return;
        }

        $cutListVideo = $this->createVideo($exercisePhaseTeam->getCreator());
        $this->messageBus->dispatch(new CutListEncodingTask($exercisePhaseTeam->getId(), $cutListVideo->getId()));
    }

    private function createVideo(User $creator): ?Video
    {
        $videoUuid = Uuid::uuid4()->toString();
        $video = new Video($videoUuid);
        $video->setCreator($creator);

        $video->setTitle('Video to be cut <' . $videoUuid . '>');
        $video->setDataPrivacyAccepted(true);
        $video->setDataPrivacyPermissionsAccepted(true);
        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager = $this->getDoctrine()->getManager();
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
        /** @var User $user */
        $user = $this->getUser();
        $solutionDataFromJson = json_decode($request->getContent(), true);

        $serverSideSolutionData = ServerSideSolutionData::fromClientJSON($solutionDataFromJson);

        // If current user is not current editor && there is a solution -> discard
        if ($user === $exercisePhaseTeam->getCurrentEditor()) {
            $autosaveSolution = new AutosavedSolution();
            $autosaveSolution->setTeam($exercisePhaseTeam);
            $autosaveSolution->setSolution($serverSideSolutionData);
            $autosaveSolution->setOwner($user);

            $this->eventStore->disableEventPublishingForNextFlush();
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($autosaveSolution);
            $entityManager->flush();

            $response = Response::create('OK');
        } else {
            $response = Response::create('Not editor!', Response::HTTP_FORBIDDEN);
        }

        $exercisePhase = $exercisePhaseTeam->getExercisePhase();
        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        // push solution to clients
        $this->liveSyncService->publish($exercisePhaseTeam, [
            'data' => $clientSideSolutionDataBuilder,
            'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId()
        ]);

        return $response;
    }

    /**
     * Update a solution of a student as Dozent.
     * This is only possible for MaterialPhases, where the Dozent can edit the material solution of a student
     * as a review process.
     *
     * @IsGranted("reviewSolution", subject="solution")
     * @Route("/exercise-phase/review-solution/{id}", name="exercise-overview__exercise-phase-team--review-solution")
     */
    public function reviewSolution(Request $request, Solution $solution): Response
    {
        $solutionDataFromJson = json_decode($request->getContent(), true);

        $serverSideSolutionData = ServerSideSolutionData::fromClientJSON($solutionDataFromJson);

        $solution->setSolution($serverSideSolutionData);
        $solution->setUpdateTimestamp(new \DateTimeImmutable());

        $this->eventStore->disableEventPublishingForNextFlush();
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($solution);
        $entityManager->flush();

        $response = Response::create('OK');

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
        $currentEditorCandidateIdFromJson = json_decode(
            $request->getContent(),
            true
        )['currentEditorCandidateId'];

        $currentEditorCandidate = $exercisePhaseTeam
            ->getMembers()
            ->filter(function (User $member) use ($currentEditorCandidateIdFromJson) {
                return $member->getId() === $currentEditorCandidateIdFromJson;
            })
            ->first();

        if (!$currentEditorCandidate) {
            return Response::create('currentEditor candidate is not member of exercisePhaseTeam!', Response::HTTP_FORBIDDEN);
        }

        $isAlreadySet = $currentEditorCandidate === $exercisePhaseTeam->getCurrentEditor();
        $userIsCandidate = $currentEditorCandidate === $user;
        $userIsCurrentEditor = $user === $exercisePhaseTeam->getCurrentEditor();

        // let only current editor or candidate make the change
        if (!$isAlreadySet && ($userIsCandidate || $userIsCurrentEditor)) {
            $exercisePhaseTeam->setCurrentEditor($currentEditorCandidate);

            // Why: We do not need the event info about the currentEditor
            $this->eventStore->disableEventPublishingForNextFlush();
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhaseTeam);
            $entityManager->flush();

            $exercisePhase = $exercisePhaseTeam->getExercisePhase();

            $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
            $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
                $clientSideSolutionDataBuilder,
                $exercisePhaseTeam,
                $exercisePhase
            );

            // push new state to clients
            $this->liveSyncService->publish(
                $exercisePhaseTeam,
                [
                    'data' => $clientSideSolutionDataBuilder,
                    'currentEditor' => $exercisePhaseTeam->getCurrentEditor()->getId()
                ]
            );
            return Response::create('OK');
        } else {
            return Response::create('Not updated!', Response::HTTP_NOT_MODIFIED);
        }
    }
}
