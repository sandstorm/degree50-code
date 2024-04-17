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
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\VideoEncoding\Message\CutListEncodingTask;
use Doctrine\ORM\EntityManagerInterface;
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
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ExercisePhaseTeamController extends AbstractController
{

    public function __construct(
        private readonly EntityManagerInterface       $entityManager,
        private readonly TranslatorInterface          $translator,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly LiveSyncService              $liveSyncService,
        private readonly MessageBusInterface          $messageBus,
        private readonly SolutionService              $solutionService,
        private readonly ExercisePhaseService         $exercisePhaseService,
        private readonly ExercisePhaseTeamRepository  $exercisePhaseTeamRepository
    )
    {
    }

    /**
     * @IsGranted("createTeam", subject="exercisePhase")
     * @Route("/exercise-phase/{id}/team/new", name="exercise-phase-team__new")
     */
    public function new(ExercisePhase $exercisePhase): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $exercise = $exercisePhase->getBelongsToExercise();

        $existingTeams = $this->exercisePhaseTeamRepository->findBy(
            [
                'exercisePhase' => $exercisePhase,
                'isTest' => false
            ]
        );

        foreach ($existingTeams as $team) {
            if ($team->getCreator() === $user) {
                $this->addFlash(
                    'danger',
                    $this->translator->trans('exercisePhaseTeam.new.messages.alreadyCreatedATeam', [], 'forms')
                );
                return $this->redirectToRoute(
                    'exercise__show-phase',
                    [
                        'id' => $exercise->getId(),
                        'phaseId' => $exercisePhase->getId()
                    ]
                );
            }
        }

        $exercisePhaseTeam = $this->exercisePhaseService->createPhaseTeam($exercisePhase, $user);
        $this->exercisePhaseService->addMemberToPhaseTeam($exercisePhaseTeam, $user);

        if ($exercisePhase->isGroupPhase()) {
            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhaseTeam.new.messages.success', [], 'forms')
            );

            return $this->redirectToRoute(
                'exercise__show-phase',
                [
                    'id' => $exercise->getId(),
                    'phaseId' => $exercisePhase->getId()
                ]
            );
        } else {
            return $this->redirectToRoute(
                'exercise-phase__show',
                [
                    'id' => $exercisePhase->getId(),
                    'team_id' => $exercisePhaseTeam->getId()
                ]
            );
        }
    }

    /**
     * @IsGranted("test", subject="exercisePhase")
     * @Route("/exercise-phase/test/{id}/team/new", name="exercise-phase-team__test-new")
     */
    public function test(ExercisePhase $exercisePhase): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $exercise = $exercisePhase->getBelongsToExercise();

        $exercisePhaseTeam = $this->exercisePhaseService->createPhaseTeam($exercisePhase, $user, true);
        $this->exercisePhaseService->addMemberToPhaseTeam($exercisePhaseTeam, $user);

        if ($exercisePhase->isGroupPhase()) {
            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhaseTeam.new.messages.success', [], 'forms')
            );

            return $this->redirectToRoute(
                'exercise__show-test-phase',
                [
                    'id' => $exercise->getId(),
                    'phaseId' => $exercisePhase->getId()
                ]
            );
        } else {
            return $this->redirectToRoute(
                'exercise-phase__test',
                [
                    'id' => $exercisePhase->getId(),
                    'team_id' => $exercisePhaseTeam->getId()
                ]
            );
        }
    }

    /**
     * @IsGranted("join", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/join", name="exercise-phase-team__join")
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
            'exercise__show-phase',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @IsGranted("delete", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/delete", name="exercise-phase-team__delete")
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

        $this->entityManager->remove($exercisePhaseTeam);
        $this->entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhaseTeam.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute(
            'exercise__show-phase',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @IsGranted("leave", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/{id}/team/{team_id}/leave", name="exercise-phase-team__leave")
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

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhaseTeam.leave.messages.success', [], 'forms')
        );

        // TODO change route from int to id of phase
        return $this->redirectToRoute(
            'exercise__show-phase',
            [
                'id' => $exercisePhase->getBelongsToExercise()->getId(),
                'phaseId' => $exercisePhase->getId()
            ]
        );
    }

    /**
     * @Route("/exercise-phase/share-result/{id}", name="exercise-phase-team__share-result")
     */
    public function shareResult(ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $this->exercisePhaseService->promoteLastAutoSavedSolutionToRealSolution($exercisePhaseTeam);
        $this->exercisePhaseService->cleanupAutoSavedSolutions($exercisePhaseTeam);
        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);

        $this->dispatchCutListEncodingTask($exercisePhaseTeam);

        $exercisePhase = $exercisePhaseTeam->getExercisePhase();

        if ($exercisePhaseTeam->isTest()) {
            return $this->redirectToRoute(
                'exercise__show-test-phase',
                [
                    'id' => $exercisePhase->getBelongsToExercise()->getId(),
                    'phaseId' => $exercisePhase->getId()
                ]
            );
        } else {
            return $this->redirectToRoute(
                'exercise__show-phase',
                [
                    'id' => $exercisePhase->getBelongsToExercise()->getId(),
                    'phaseId' => $exercisePhase->getId()
                ]
            );
        }
    }

    /**
     * @Route("/exercise-phase/finish-reflexion/{id}", name="exercise-phase-team--finish-reflexion")
     */
    public function finishReflexion(ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        // TODO
        // We might refactor this, so that this can be part of share_result instead and we
        // no longer have the distinction inside the template (and also would not need this route anymore)

        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);

        $exercisePhase = $exercisePhaseTeam->getExercisePhase();
        $this->eventStore->addEvent('ReflexionFinished', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
        ]);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        return $this->redirectToRoute(
            'exercise__show-phase',
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
        $this->entityManager->persist($video);
        $this->entityManager->flush();

        return $video;
    }

    /**
     * Try to create a new AutosaveSolution and then publish the most recent version of the solution.
     *
     * @IsGranted("updateSolution", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/update-solution/{id}", name="exercise-phase-team__update-solution")
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
            $this->entityManager->persist($autosaveSolution);
            $this->entityManager->flush();

            $response = new Response('OK');
        } else {
            $response = new Response('Not editor!', Response::HTTP_FORBIDDEN);
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
     * @Route("/exercise-phase/review-solution/{id}", name="exercise-phase-team__review-solution")
     */
    public function reviewSolution(Request $request, Solution $solution): Response
    {
        $solutionDataFromJson = json_decode($request->getContent(), true);

        $serverSideSolutionData = ServerSideSolutionData::fromClientJSON($solutionDataFromJson);

        $solution->setSolution($serverSideSolutionData);
        $solution->setUpdateTimestamp(new \DateTimeImmutable());

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->persist($solution);
        $this->entityManager->flush();

        $response = new Response('OK');

        return $response;
    }

    /**
     * Try to update the currentEditor of the TeamPhase and then publish the most recent solution
     *
     * @IsGranted("updateSolution", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/update-current-editor/{id}", name="exercise-phase-team__update-current-editor")
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
            return new Response('currentEditor candidate is not member of exercisePhaseTeam!', Response::HTTP_FORBIDDEN);
        }

        $isAlreadySet = $currentEditorCandidate === $exercisePhaseTeam->getCurrentEditor();
        $userIsCandidate = $currentEditorCandidate === $user;
        $userIsCurrentEditor = $user === $exercisePhaseTeam->getCurrentEditor();

        // let only current editor or candidate make the change
        if (!$isAlreadySet && ($userIsCandidate || $userIsCurrentEditor)) {
            $exercisePhaseTeam->setCurrentEditor($currentEditorCandidate);

            // Why: We do not need the event info about the currentEditor
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->persist($exercisePhaseTeam);
            $this->entityManager->flush();

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
            return new Response('OK');
        } else {
            return new Response('Not updated!', Response::HTTP_NOT_MODIFIED);
        }
    }
}
