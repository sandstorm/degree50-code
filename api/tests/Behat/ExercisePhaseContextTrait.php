<?php

namespace App\Tests\Behat;

use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\ServerSideSolutionData\ServerSideSolutionData;
use App\Entity\Exercise\Solution;
use App\Entity\Exercise\VideoCode;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertEqualsCanonicalizing;
use function PHPUnit\Framework\assertNotNull;

/**
 *
 */
trait ExercisePhaseContextTrait
{

    /**
     * @Given I have an exercise phase :exercisePhaseId belonging to exercise :exerciseId
     */
    public function iHaveAnExercisePhaseBelongingToExercise($exercisePhaseId, $exerciseId)
    {
        /** @var Exercise $exercise */
        $exercise = $this->entityManager->find(Exercise::class, $exerciseId);
        $exercise->addPhase(new VideoAnalysisPhase($exercisePhaseId));

        $this->entityManager->persist($exercise);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a team with ID :teamId belonging to exercise phase :exercisePhaseId
     */
    public function iHaveATeamWithIdBelongingToExercisePhase($teamId, $exercisePhaseId)
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);

        $exercisePhaseTeam = new ExercisePhaseTeam($teamId);
        $exercisePhaseTeam->setExercisePhase($exercisePhase);

        $exercisePhase->addTeam($exercisePhaseTeam);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->persist($exercisePhase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a team with ID :teamId belonging to exercise phase :exercisePhaseId and creator :creatorId
     */
    public function iHaveATeamWithIdBelongingToExercisePhaseAndCreatorId($teamId, $exercisePhaseId, $creatorId)
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);
        /** @var User $creator */
        $creator = $this->entityManager->find(User::class, $creatorId);

        $exercisePhaseTeam = new ExercisePhaseTeam($teamId);
        $exercisePhaseTeam->setCreator($creator);
        $exercisePhaseTeam->setExercisePhase($exercisePhase);

        $exercisePhase->addTeam($exercisePhaseTeam);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->persist($exercisePhase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a predefined videoCodePrototype belonging to exercise phase :exercisePhaseId and with properties
     */
    public function iHaveAPredefinedVideocodeprototypeWithIdBelongingToExecisePhaseAndWithProperties(
        $exercisePhaseId,
        TableNode $propertyTable
    ) {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);

        $data = $propertyTable->getHash()[0];
        $videoCodePrototype = new VideoCode($data['id']);
        $videoCodePrototype->setName($data['name']);
        $videoCodePrototype->setColor($data['color']);
        $videoCodePrototype->setExercisePhase($exercisePhase);

        $exercisePhase->addVideoCode($videoCodePrototype);

        $this->entityManager->persist($videoCodePrototype);
        $this->entityManager->persist($exercisePhase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a solution with ID :solutionId belonging to team with ID :teamId with solutionData as JSON
     */
    public function iHaveASolutionWithIdBelongingToTeamWithIdWithSolutionlistsAsJson($solutionId, $teamId, PyStringNode $serverSideSolutionListsAsJSON)
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);

        $solution = new Solution($solutionId);
        $arrayFromJson = json_decode($serverSideSolutionListsAsJSON->getRaw(), true);
        $serverSideSolutionLists = ServerSideSolutionData::fromArray($arrayFromJson);
        $solution->setSolution($serverSideSolutionLists);
        $exercisePhaseTeam->setSolution($solution);

        $this->entityManager->persist($solution);
        $this->entityManager->persist($exercisePhaseTeam);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have an empty solution with ID :solutionId belonging to team :teamId
     */
    public function iHaveAnEmptySolutionWithIdBelongingToTeam($solutionId, $teamId)
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);

        $solution = new Solution($solutionId);
        $exercisePhaseTeam->setSolution($solution);

        $this->entityManager->persist($solution);
        $this->entityManager->persist($exercisePhaseTeam);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have an auto saved solution with ID :autoSavedSolutionId belonging to team :teamId with solutionData as JSON
     */
    public function iHaveAnAutoSavedSolutionWithIdBelongingToTeamWithSolutiondataAsJson(
        $autoSavedSolutionId,
        $teamId,
        PyStringNode $serverSideSolutionListsAsJSON
    ) {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        $autosaveSolution = new AutosavedSolution($autoSavedSolutionId);
        $autosaveSolution->setTeam($exercisePhaseTeam);
        $solutionListsFromJson = json_decode($serverSideSolutionListsAsJSON->getRaw(), true);
        $serverSideSolutionLists = ServerSideSolutionData::fromArray($solutionListsFromJson);
        $autosaveSolution->setSolution($serverSideSolutionLists);
        /** @var TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        /* @var User $loggedInUser */
        $loggedInUser = $tokenStorage->getToken()->getUser();
        $autosaveSolution->setOwner($loggedInUser);

        $this->entityManager->persist($autosaveSolution);
        $this->entityManager->persist($exercisePhaseTeam);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @When I convert the persisted serverSideSolution for team :teamId to the clientSideSolution
     */
    public function iConvertThePersistedServersidesolutionForTeamToTheClientsidesolution($teamId)
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        $exercisePhase = $exercisePhaseTeam->getExercisePhase();

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilder(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeam,
            $exercisePhase
        );

        $this->clientSideJSON = json_encode($clientSideSolutionDataBuilder);
    }

    /**
     * @Then I get normalized client side data as JSON
     */
    public function iGetNormalizedClientSideDataAsJson(PyStringNode $expectedJSON)
    {
        $expected = json_decode($expectedJSON->getRaw(), true);
        $actual = json_decode($this->clientSideJSON, true);

        assertEqualsCanonicalizing($expected, $actual);
    }

    /**
     * @Given The exercise phase :exercisePhaseId1 depends on the previous phase :exercisePhaseId2
     */
    public function theExercisePhaseDependsOnThePreviousPhase($exercisePhaseId1, $exercisePhaseId2)
    {
        /** @var ExercisePhase $exercisePhase1 */
        $exercisePhase1 = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId1);
        /** @var ExercisePhase $exercisePhase2 */
        $exercisePhase2 = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId2);

        $exercisePhase1->setDependsOnExercisePhase($exercisePhase2);
        $exercisePhase1->setSorting(2);
        $exercisePhase2->setSorting(1);

        $this->entityManager->persist($exercisePhase1);
        $this->entityManager->persist($exercisePhase2);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I am a member of :teamId
     */
    public function iAmAMemberOf($teamId)
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        /** @var TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        /** @var User $loggedInUser */
        $loggedInUser = $tokenStorage->getToken()->getUser();

        $exercisePhaseTeam->addMember($loggedInUser);
    }

    /**
     * @When I convert the persisted serverSideSolutions for all teams of exercise phase :exercisePhaseId to the client side data
     */
    public function iConvertThePersistedServersidesolutionsForAllTeamsOfExercisePhaseToTheClientSideData($exercisePhaseId)
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);
        $exercisePhaseTeams = $exercisePhase->getTeams()->toArray();

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder($this->exercisePhaseService);
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilderForSolutionView(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeams
        );

        $this->clientSideJSON = json_encode($clientSideSolutionDataBuilder);
    }

    /**
     * @Given User :username belongs to :teamId
     */
    public function userBelongsTo($username, $teamId)
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $exercisePhaseTeam->addMember($user);
    }

    /**
     * @Given The User :username is member of ExercisePhaseTeam :teamId
     */
    public function ensureTheUserIsMemberOfExercisePhaseTeam($username, $teamId)
    {
        /** @var ExercisePhaseTeam $team */
        $team = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $team->addMember($user);
        $team->setCreator($user);

        $this->entityManager->persist($team);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given The ExercisePhaseTeam :teamId has a Solution :solutionId
     */
    public function ensureTheExercisePhaseTeamHasASolution($teamId, $solutionId)
    {
        /** @var ExercisePhaseTeam $team */
        $team = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        /** @var Solution $solution */
        $solution = $this->entityManager->find(Solution::class, $solutionId);

        if (!$solution) {
            $solution = new Solution($solutionId);
            $this->entityManager->persist($solution);
        }

        $team->setSolution($solution);

        $this->entityManager->persist($team);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given The User :username has created an AutosavedSolution :autosavedSolutionId for ExercisePhaseTeam :teamId
     */
    public function ensureTheUserHasCreatedAnAutosavedSolutionForExerciseTeam($username, $autosavedSolutionId, $teamId)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);
        /** @var ExercisePhaseTeam $team */
        $team = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        /** @var AutosavedSolution $autosavedSolution */
        $autosavedSolution = $this->entityManager->find(AutosavedSolution::class, $autosavedSolutionId);

        if (!$autosavedSolution) {
            $autosavedSolution = new AutosavedSolution($autosavedSolutionId);
        }

        $autosavedSolution->setOwner($user);
        $team->addAutosavedSolution($autosavedSolution);

        $this->entityManager->persist($autosavedSolution);
        $this->entityManager->persist($team);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then No ExercisePhaseTeam created by User :username should exist
     */
    public function assertExercisePhaseTeamsCreatedByUserDoNotExist($username)
    {
        $allTeams = $this->entityManager->getRepository(ExercisePhaseTeam::class)->findAll();
        $teamsCreatedByUser = array_filter($allTeams, function (ExercisePhaseTeam $team) use ($username) {
            return $team->getCreator()->getUsername() === $username;
        });

        assertEquals(0, count($teamsCreatedByUser));
    }

    /**
     * @Then No AutosavedSolution of User :username does exist
     */
    public function assertAutosavedSolutionsOfUserDoNotExist($username)
    {
        $allAutosavedSolutions = $this->entityManager->getRepository(AutosavedSolution::class)->findAll();
        $autosavedSolutionsOfUser = array_filter($allAutosavedSolutions, function (AutosavedSolution $autosavedSolution) use ($username) {
            return $autosavedSolution->getOwner()->getUsername() === $username;
        });

        assertEquals(0, count($autosavedSolutionsOfUser));
    }


    public function createExercisePhase(array $phaseData): ExercisePhase
    {
        $phaseType = ExercisePhaseType::from($phaseData['type']);

        $phase = ExercisePhase::byType($phaseType, $phaseData['id']);

        $phase->setName($phaseData['name']);
        $phase->setTask($phaseData['task']);
        $phase->setIsGroupPhase((boolval($phaseData['isGroupPhase'])));
        $phase->setSorting(intval($phaseData['sorting']));
        $phase->setOtherSolutionsAreAccessible(boolval($phaseData['otherSolutionsAreAccessible']));

        /** @var Exercise $exercise */
        $exercise = $this->entityManager->find(Exercise::class, $phaseData['belongsToExercise']);
        $phase->setBelongsToExercise($exercise);
        $exercise->addPhase($phase);

        if ($phaseData['dependsOnPhase'] !== null) {
            /** @var ExercisePhase $phaseDependingOn */
            $phaseDependingOn = $this->entityManager->find(ExercisePhase::class, $phaseData['dependsOnPhase']);
            $phase->setDependsOnExercisePhase($phaseDependingOn);
        }

        // phase type specific
        switch ($phaseType) {
            case ExercisePhaseType::VIDEO_ANALYSIS:
                $phase->setVideoAnnotationsActive(boolval($phaseData['videoAnnotationsActive']));
                $phase->setVideoCodesActive(boolval($phaseData['videoCodesActive']));
                break;
            case ExercisePhaseType::VIDEO_CUT:
            case ExercisePhaseType::REFLEXION:
            case ExercisePhaseType::MATERIAL:
                break;
        }

        $this->entityManager->persist($phase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();

        return $phase;
    }


    public function assertExercisePhaseTeamForUserExists(User $user, ExercisePhase $exercisePhase)
    {
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);

        assertNotNull($exercisePhaseTeam);
    }

    /**
     * @Given An ExercisePhase with the following data exists:
     *
     * TODO: rename Given step so that it better represents, what this actually does
     */
    public function assureExercisePhasesWithTheFollowingDataExist(TableNode $tableNode)
    {
        foreach ($tableNode->getHash() as $phaseData) {
            $this->createExercisePhase($phaseData);
        }
    }

    /**
     * @Given An ExercisePhase with the following json-data exists:
     *
     * This is just another way to use the step above, because oftentimes configuring
     * the step via JSON is much more convenient and easier to read for large data sets.
     */
    public function assureAnExercisePhaseWithTheFollowingJsonDataExists(PyStringNode $exercisePhaseDataJson)
    {
        $phases = json_decode($exercisePhaseDataJson->getRaw(), true);
        foreach ($phases as $phaseData) {
            $this->createExercisePhase($phaseData);
        }
    }
}
