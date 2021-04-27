<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use App\DataExport\Controller\DegreeDataToCsvService;
use App\DataExport\Controller\Dto\CSVDto;
use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\AutosavedSolution;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Exercise\Material;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideSolutionLists;
use App\Entity\Exercise\Solution;
use App\Entity\Exercise\VideoCode;
use App\Entity\Video\Video;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ClientSideSolutionData\ClientSideSolutionDataBuilder;
use App\Exercise\Controller\SolutionService;
use Behat\Behat\Context\Context;
use Behat\Behat\Tester\Exception\PendingException;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\Mink\Session;
use Behat\Mink\WebAssert;
use DAMA\DoctrineTestBundle\Doctrine\DBAL\StaticDriver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Security;

use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertEqualsCanonicalizing;
use function PHPUnit\Framework\assertIsObject;

/**
 * This context class contains the definitions of the steps used by the demo
 * feature file. Learn how to get started with Behat and BDD on Behat's website.
 *
 * @see http://behat.org/en/latest/quick_start.html
 */
final class DegreeContext implements Context
{

    use DatabaseFixtureContextTrait;

    private Session $minkSession;
    private RouterInterface $router;
    protected EntityManagerInterface $entityManager;
    protected KernelInterface $kernel;
    private DoctrineIntegratedEventStore $eventStore;
    private Security $security;
    private SolutionService $solutionService;
    private DegreeDataToCsvService $degreeDataToCSVService;

    private ?string $clientSideJSON;

    /** @var CSVDto[] $csvDtoList */
    private ?array $csvDtoList;

    /**
     * DegreeContext constructor.
     * @param Session $minkSession
     * @param RouterInterface $router
     * @param EntityManagerInterface $entityManager
     * @param KernelInterface $kernel
     */
    public function __construct(
        Session $minkSession,
        RouterInterface $router,
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        KernelInterface $kernel,
        Security $security,
        SolutionService $solutionService,
        DegreeDataToCsvService $degreeDataToCsvService
    )
    {
        $this->minkSession = $minkSession;
        $this->router = $router;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->kernel = $kernel;
        $this->security = $security;
        $this->solutionService = $solutionService;
        $this->degreeDataToCSVService = $degreeDataToCsvService;
    }


    /**
     * @When I visit route :routeName
     */
    public function visitRoute(string $routeName): void
    {
        // TODO we might directly submit a request on symfonys kernel instead of using minkSession
        $this->minkSession->visit($this->router->generate($routeName));
    }

    /**
     * @When I visit route :routeName with parameters as JSON :jsonParameters
     */
    public function visitRouteWithJsonParameters(string $routeName, string $jsonParameters): void
    {
        $parameters = [];
        if (!empty($jsonParameters)) {
            $parameters = json_decode($jsonParameters, true);
        }
        $this->minkSession->visit($this->router->generate($routeName, $parameters));
    }

    /**
     * @When I visit route :routeName with parameters
     */
    public function aDemoScenarioSendsARequestTo(string $routeName): void
    {
        $this->minkSession->visit($this->router->generate($routeName));
    }

    /**
     * @Then /^the response status code should be (?P<code>\d+)$/
     */
    public function assertResponseStatus($code)
    {
        $this->assertSession()->statusCodeEquals($code);
    }

    /** @return WebAssert  */
    public function assertSession(): WebAssert
    {
        return new WebAssert($this->minkSession);
    }

    /**
     * @Then I am redirected to the login page
     */
    public function iAmRedirectedToTheLoginPage()
    {
        $this->assertSession()->pageTextContains('Einloggen');
    }

    /**
     * @Given I am logged in as :username
     */
    public function iAmLoggedInAs($username)
    {
        $user = $this->entityManager->find(User::class, $username);
        if (!$user) {
            $user = new User($username);
            $user->setEmail($username);
            $user->setPassword('password');
            $this->entityManager->persist($user);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();
        }

        /* @var $tokenStorage \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $tokenStorage->setToken(new UsernamePasswordToken($username, 'foo', 'foo'));
        $tokenStorage->getToken()->setUser($user);
    }

    /**
     * @Given I am not logged in
     */
    public function iAmNotLoggedIn()
    {
        /** @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $tokenStorage->setToken(null);
    }

    /**
     * @Given I have a video with ID :videoId belonging to course :courseId
     */
    public function iHaveAVideoRememberingItsIDAsVIDEOID($videoId, $courseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        $video = new Video($videoId);
        $video->addCourse($course);
        $video->setDataPrivacyAccepted(true);
        $video->setDataPrivacyPermissionsAccepted(true);
        $video->setCreator($this->security->getUser());

        $this->entityManager->persist($video);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have an exercise with ID :exerciseId belonging to course :courseId
     */
    public function iHaveAnExercise($exerciseId, $courseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        $exercise = new Exercise($exerciseId);
        $exercise->setCourse($course);
        $course->addExercise($exercise);

        $this->entityManager->persist($exercise);
        $this->entityManager->persist($course);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a course with ID :courseId
     */
    public function iHaveACourseWithID($courseId)
    {
        $user = $this->entityManager->find(User::class, 'foo@bar.de');

        $course = new Course($courseId);
        $courseRole = new CourseRole();
        $courseRole->setUser($user);
        $courseRole->setCourse($course);
        $courseRole->setName(CourseRole::DOZENT);

        $this->entityManager->persist($courseRole);

        $course->addCourseRole($courseRole);

        $this->entityManager->persist($course);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

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
     * @Given I have a material with ID :materialId
     */
    public function iHaveAMaterialWithId($materialId)
    {
        $material = new Material($materialId);
        $fileName = tempnam(sys_get_temp_dir(), 'foo');
        file_put_contents($fileName, 'my file');
        $file = new File($fileName);
        $material->setName($file);
        $material->setMimeType('application/pdf');

        $user = $this->entityManager->find(User::class, 'foo@bar.de');
        $material->setCreator($user);

        $this->entityManager->persist($material);
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
     * @Given I have a predefined videoCodePrototype belonging to execise phase :exercisePhaseId and with properties
     */
    public function iHaveAPredefinedVideocodeprototypeWithIdBelongingToExecisePhaseAndWithProperties(
        $exercisePhaseId,
        TableNode $propertyTable
    )
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);

        $data = $propertyTable->getHash()[0];
        $videoCodePrototype = new VideoCode($data['id']);
        $videoCodePrototype->setName($data['name']);
        $videoCodePrototype->setDescription($data['description']);
        $videoCodePrototype->setColor($data['color']);
        $videoCodePrototype->setExercisePhase($exercisePhase);

        $exercisePhase->addVideoCode($videoCodePrototype);

        $this->entityManager->persist($videoCodePrototype);
        $this->entityManager->persist($exercisePhase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a solution with ID :solutionId belonging to team with ID :teamId with solutionLists as JSON
     */
    public function iHaveASolutionWithIdBelongingToTeamWithIdWithSolutionListsAsJson($solutionId, $teamId, PyStringNode $serverSideSolutionListsAsJSON)
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);

        $solution = new Solution($solutionId);
        $arrayFromJson = json_decode($serverSideSolutionListsAsJSON->getRaw(), true);
        $serverSideSolutionLists = ServerSideSolutionLists::fromArray($arrayFromJson);
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
     * @Given I have an auto saved solution with ID :autoSavedSolutionId belonging to team :teamId with solutionLists as JSON
     */
    public function iHaveAnAutoSavedSolutionWithIdBelongingToTeamWithSolutionlistsAsJson(
        $autoSavedSolutionId,
        $teamId,
        PyStringNode $serverSideSolutionListsAsJSON
    )
    {
        /** @var ExercisePhaseTeam $exercisePhaseTeam */
        $exercisePhaseTeam = $this->entityManager->find(ExercisePhaseTeam::class, $teamId);
        $autosaveSolution = new AutosavedSolution($autoSavedSolutionId);
        $autosaveSolution->setTeam($exercisePhaseTeam);
        $solutionListsFromJson = json_decode($serverSideSolutionListsAsJSON->getRaw(), true);
        $serverSideSolutionLists = ServerSideSolutionLists::fromArray($solutionListsFromJson);
        $autosaveSolution->setSolution($serverSideSolutionLists);
        /** @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
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

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder();
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
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase1 = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId1);
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase2 = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId2);

        $exercisePhase1->setDependsOnPreviousPhase(true);
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
        /** @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
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

        $clientSideSolutionDataBuilder = new ClientSideSolutionDataBuilder();
        $this->solutionService->retrieveAndAddDataToClientSideDataBuilderForSolutionView(
            $clientSideSolutionDataBuilder,
            $exercisePhaseTeams
        );

        $this->clientSideJSON = json_encode($clientSideSolutionDataBuilder);
    }

    /**
     * @Given I have a cut video :cutVideoId belonging to solution :solutionId
     */
    public function iHaveACutVideoBelongingToSolution($cutVideoId, $solutionId)
    {
        /** @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $loggedInUser = $tokenStorage->getToken()->getUser();

        // NOTE: we do not save a video file here only the wrapping model,
        // because we do not test for the file itself!
        $cutVideo = new Video($cutVideoId);
        $cutVideo->setCreator($loggedInUser);
        $cutVideo->setDataPrivacyAccepted(true);
        $cutVideo->setDataPrivacyPermissionsAccepted(true);
        $cutVideo->setTitle('TEST: CutVideo');
        $cutVideo->setEncodingStatus(Video::ENCODING_FINISHED);
        $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $cutVideo->getId());
        $cutVideo->setEncodedVideoDirectory($outputDirectory);

        /** @var Solution $solution */
        $solution = $this->entityManager->find(Solution::class, $solutionId);

        $solution->setCutVideo($cutVideo);

        $this->entityManager->persist($cutVideo);
        $this->entityManager->persist($solution);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @When I convert all data for :courseId to csv
     */
    public function iConvertAllDataForCourseToCsv(string $courseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);
        $this->csvDtoList = $this->degreeDataToCSVService->getAllAsVirtualCSVs($course);
    }

    /**
     * @Then I have a CSVDto-list containing a file :fileName with a CSV content string
     */
    public function iHaveACsvDtoListContainingAFileWithACsvContentString(string $fileName, PyStringNode $contentString)
    {
        /** @var CSVDto $csvDto */
        $csvDto = current(array_filter($this->csvDtoList, function(CSVDto $cSVDto) use($fileName) {
            return $cSVDto->getFileName() === $fileName;
        }));

        assertIsObject($csvDto);
        assertEquals($contentString->getRaw(), $csvDto->getContentString());
    }

    /**
     * @Given A user :username exists
     */
    public function aUserExists(string $username)
    {
        $user = $this->entityManager->find(User::class, $username);
        if (!$user) {
            $user = new User($username);
            $user->setEmail($username);
            $user->setPassword('password');
            $this->entityManager->persist($user);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();
        }
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
}
