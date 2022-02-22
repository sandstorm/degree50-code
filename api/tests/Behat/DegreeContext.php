<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use ApiPlatform\Core\Exception\InvalidArgumentException;
use App\Admin\Controller\UserService;
use App\DataExport\Controller\DegreeDataToCsvService;
use App\DataExport\Controller\Dto\TextFileDto;
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
use App\Exercise\Controller\ExerciseService;
use App\Exercise\Controller\SolutionService;
use App\Mediathek\Service\VideoService;
use App\Repository\Exercise\ExerciseRepository;
use App\Repository\Video\VideoRepository;
use Behat\Behat\Context\Context;
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

use function PHPUnit\Framework\assertEmpty;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertEqualsCanonicalizing;
use function PHPUnit\Framework\assertIsObject;
use function PHPUnit\Framework\assertNotEquals;

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
    private UserService $userService;
    private VideoService $videoService;
    private ExerciseService $exerciseService;

    private ?string $clientSideJSON;

    /** @var TextFileDto[] $csvDtoList */
    private ?array $csvDtoList;

    private ?array $queryResult;

    public function __construct(
        Session $minkSession,
        RouterInterface $router,
        EntityManagerInterface $entityManager,
        DoctrineIntegratedEventStore $eventStore,
        KernelInterface $kernel,
        Security $security,
        SolutionService $solutionService,
        DegreeDataToCsvService $degreeDataToCsvService,
        UserService $userService,
        VideoService $videoService,
        ExerciseService $exerciseService
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
        $this->userService = $userService;
        $this->videoService = $videoService;
        $this->exerciseService = $exerciseService;
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
        $this->assertSession()->pageTextContains('Login mit Uni-Account (SSO)');
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

        /** @var $tokenStorage \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface */
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
        /** @var Video $video */
        $video = $this->entityManager->find(Video::class, $videoId);

        if (!$video) {
            $video = new Video($videoId);
            $video->setDataPrivacyAccepted(true);
            $video->setDataPrivacyPermissionsAccepted(true);
            $video->setCreator($this->security->getUser());
            $video->setTitle('TEST_Video_' . $videoId);
            $video->setEncodingStatus(Video::ENCODING_FINISHED);
            $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
            $video->setEncodedVideoDirectory($outputDirectory);
        }

        $video->addCourse($course);

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
        /* @var User $user */
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
        $material->setName($fileName);
        $material->setMimeType('application/pdf');

        /* @var User $user */
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
        /** @var TextFileDto $csvDto */
        $csvDto = current(array_filter($this->csvDtoList, function(TextFileDto $cSVDto) use($fileName) {
            return $cSVDto->getFileName() === $fileName;
        }));

        $currentDate = new \DateTimeImmutable();
        $expected = str_replace('{{CREATED_AT_DATE}}', $currentDate->format("d.m.Y"), $contentString->getRaw());

        assertIsObject($csvDto, "Virtual File <" . $fileName . "> not found in dtoList!");
        assertEquals($expected, $csvDto->getContentString());
    }

    /**
     * @Then I have CSVDto-list containing a file :fileName
     */
    public function iHaveCsvdtoListContainingAFile($fileName)
    {
        /** @var TextFileDto $csvDto */
        $csvDto = current(array_filter($this->csvDtoList, function(TextFileDto $cSVDto) use($fileName) {
            return $cSVDto->getFileName() === $fileName;
        }));
        assertIsObject($csvDto, "Virtual File <" . $fileName . "> not found in dtoList!");
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

    /**
     * @Given Exercise phase :currentExercisePhaseID depends on previous phase :previousExercisePhaseID
     */
    public function exercisePhaseDependsOnPreviousPhase($currentExercisePhaseID, $previousExercisePhaseID)
    {
        /** @var ExercisePhase $currentExercisePhase */
        $currentExercisePhase = $this->entityManager->find(ExercisePhase::class, $currentExercisePhaseID);
        /** @var ExercisePhase $previousExercisePhase */
        $previousExercisePhase = $this->entityManager->find(ExercisePhase::class, $previousExercisePhaseID);

        $previousExercisePhase->setSorting(0);
        $currentExercisePhase->setSorting(1);
        $currentExercisePhase->setDependsOnPreviousPhase(true);

        $this->entityManager->persist($previousExercisePhase);
        $this->entityManager->persist($currentExercisePhase);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given A User :username with the role :role exists
     */
    public function aUserWithTheRoleExists($username, $role)
    {
        // create user if it does not exist
        $this->aUserExists($username);

        // add the role
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);
        $user->setRoles([$role]);

        // persist
        $this->entityManager->persist($user);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @When I delete User :username
     */
    public function iDeleteUser($username)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $this->userService->removeUser($user);
    }

    /**
     * @Given The User :username has CourseRole :courseRole in Course :courseId
     */
    public function userHasCourseRole($username, $courseRoleRole, $courseId)
    {
        if (!in_array($courseRoleRole, CourseRole::ROLES)) {
            throw new InvalidArgumentException(
                'Invalid CourseRole! Expected one of [' .
                implode(', ', CourseRole::ROLES) .
                ']. Given: "' . $courseRoleRole . '".'
            );
        }

        /* @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        /* @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $courseRole = new CourseRole();
        $courseRole->setCourse($course);
        $courseRole->setUser($user);
        $courseRole->setName($courseRoleRole);

        $user->addCourseRole($courseRole);

        $this->entityManager->persist($courseRole);
        $this->entityManager->persist($user);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then User :username should not exist
     */
    public function assertUserDoesNotExist($username)
    {
        assertEquals(null, $this->entityManager->find(User::class, $username));
    }

    /**
     * @Then No Exercise created by User :username should exist
     */
    public function assertExercisesByUserDoNotExist($username)
    {
        /** @var ExerciseRepository $repository */
        $repository = $this->entityManager->getRepository(Exercise::class);

        /**
         * Why
         * We want to find _all_ Exercises of the user without doctrine filtering out any of them
         */
        $this->entityManager->getFilters()->disable('exercise_doctrine_filter');
        $exercises = $repository->findAll();
        $this->entityManager->getFilters()->enable('exercise_doctrine_filter');

        /**
         * Why
         * If the user does not exist anymore, we can't compare the Exercise::$creator with it.
         * That's why we compare the username of the creator with the username we still have.
         */
        $exercisesCreatedByUser = array_filter(
            $exercises,
            function (Exercise $exercise) use ($username)
            {
                return $exercise->getCreator()->getUsername() === $username;
            }
        );

        assertEquals(0, count($exercisesCreatedByUser));
    }

    /**
     * @Then No Video created by User :username should exist
     */
    public function assertVideosByUserDoNotExist($username)
    {
        /** @var VideoRepository $videoRepository */
        $videoRepository = $this->entityManager->getRepository(Video::class);

        /**
         * Why
         * We want to find _all_ Videos of the user without doctrine filtering out any of them
         */
        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $videos = $videoRepository->findAll();
        $this->entityManager->getFilters()->enable('video_doctrine_filter');

        /**
         * Why
         * @see assertExercisesByUserDoNotExist $exercises
         */
        $videosCreatedByUser = array_filter(
            $videos,
            function (Video $video) use ($username)
            {
                return $video->getCreator() === $username;
            }
        );

        assertEquals(0, count($videosCreatedByUser));
    }

    /**
     * @Given A Course with ID :courseId exists
     */
    public function ensureCourseExists($courseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        if (!$course) {
            $course = new Course($courseId);

            $this->entityManager->persist($course);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();
        }
    }

    /**
     * @Given An Exercise with ID :exerciseId created by User :username in Course :courseId exists
     */
    public function ensureExerciseByUserInCourseExists($exerciseId, $username, $courseId)
    {
        /** @var Exercise $exercise */
        $exercise = $this->entityManager->getRepository(Exercise::class)->find($exerciseId);
        /** @var User $user */
        $user = $this->entityManager->getRepository(User::class)->find($username);
        /** @var Course $course */
        $course = $this->entityManager->getRepository(Course::class)->find($courseId);

        if (!$exercise) {
            $exercise = new Exercise($exerciseId);
        }

        $exercise->setCreator($user);
        // This also sets the course on the exercise
        $course->addExercise($exercise);

        $this->entityManager->persist($course);
        $this->entityManager->persist($exercise);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();

        /**
         * Why
         *   I had the problem, that the Exercise was not created correctly.
         *
         * FIXME: Once the Exercise can be created via ExerciseService use that
         *        instead. This functionality will be then tested there.
         */
        /** @var Exercise $testExercise */
        $testExercise = $this->entityManager->find(Exercise::class, $exerciseId);
        assertEquals($username, $testExercise->getCreator()->getId());
    }

    /**
     * @Given A Video with ID :videoId created by User :username exists
     */
    public function ensureVideoByUserExists($videoId, $username)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        $video = new Video($videoId);
        $video->setCreator($user);
        $video->setDataPrivacyAccepted(true);
        $video->setDataPrivacyPermissionsAccepted(true);
        $video->setTitle('TEST: CutVideo');
        $video->setEncodingStatus(Video::ENCODING_FINISHED);
        $outputDirectory = VirtualizedFile::fromMountPointAndFilename('encoded_videos', $video->getId());
        $video->setEncodedVideoDirectory($outputDirectory);

        $this->entityManager->persist($video);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
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

    /**
     * @Then No CourseRole of User :username exists
     *
     * TODO: userId vs userName? It's the same string but not the same meaning.
     */
    public function assertNoCourseRoleOfUserExists($username)
    {
        /** @var CourseRole[] $allCourseRoles */
        $allCourseRoles = $this->entityManager->getRepository(CourseRole::class)->findAll();
        $courseRolesOfUser = array_filter($allCourseRoles, function (CourseRole $courseRole) use ($username) {
            return $courseRole->getUser()->getUsername() === $username;
        });

        assertEquals(0, count($courseRolesOfUser));
    }

    /**
     * @Given A Material with Id :materialId created by User :username exists for ExercisePhase :exercisePhaseId
     */
    public function ensureMaterialByUserExistsInExercisePhase($materialId, $username, $exercisePhaseId)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);
        /** @var Material $material */
        $material = $this->entityManager->find(Material::class, $materialId);

        if (!$material) {
            $material = new Material($materialId);
            $fileName = tempnam(sys_get_temp_dir(), 'foo');
            file_put_contents($fileName, 'my file');
            $material->setName($fileName);
            $material->setMimeType('application/pdf');
        }

        $material->setCreator($user);
        $exercisePhase->addMaterial($material);

        $this->entityManager->persist($exercisePhase);
        $this->entityManager->persist($material);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Then The User :username is anonymized and their unused content removed
     */
    public function assertUserIsAnonymizedAndUnusedContentIsRemoved($username)
    {
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $username);

        /**
         * Why
         *   We check the User's username to verify that the user is correctly anonymized
         */
        assertNotEquals($username, $user->getUsername(), "Username should be anonymized.");

        // material
        $materialByUser = $this->entityManager->getRepository(Material::class)->findBy(['creator' => $user]);
        $materialNotCorrectlyRemoved = array_filter($materialByUser, function (Material $material) use ($username) {
            // material is not used in unpublished Exercise
            $notUnpublished = $material->getExercisePhase()->getBelongsToExercise()->getStatus() !== Exercise::EXERCISE_CREATED;
            // material user is not $username
            $usernameIsAnonymized = $material->getCreator()->getUsername() !== $username;

            return !($notUnpublished || $usernameIsAnonymized);
        });

        assertEquals(0, count($materialNotCorrectlyRemoved), "Unused Material should be removed.");

        // videos
        $videos = $this->videoService->getVideosCreatedByUserWithoutFilters($user);
        $videosNotCorrectlyRemoved = array_filter($videos, function (Video $video) use ($username) {
            // video is not _only_ used in unpublished Exercise
            // If it is used in just a single published Exercise it has to persist
            $notAllExercisesUnpublished = !$video->getExercisePhases()
                ->forAll(fn ($_i, Exercise $exercise) => $exercise->getStatus() === Exercise::EXERCISE_CREATED);

            $creatorAnonymized = $video->getCreator()->getUsername() !== $username;

            return !($notAllExercisesUnpublished || $creatorAnonymized);
        });

        assertEquals(0, count($videosNotCorrectlyRemoved), "Unused Videos should be removed.");

        // courseRoles
        $courseRolesWithUser = $this->entityManager->getRepository(CourseRole::class)->findBy(['user' => $user]);
        assertEquals(0, count($courseRolesWithUser), "User should not have CourseRoles.");
        assertEquals(0, $user->getCourseRoles()->count(), "User should not have CourseRoles.");

        // exercises (unpublished)
        $exercises = $this->exerciseService->getExercisesCreatedByUserWithoutFilters($user);
        $exercisesNotUnpublishedAndAnonymized =
            count(
                array_filter($exercises, function (Exercise $exercise) use ($username) {
                    $published = $exercise->getStatus() !== Exercise::EXERCISE_CREATED;
                    $usernameAnonymized = $exercise->getCreator()->getUsername() !== $username;

                    return !($published || $usernameAnonymized);
                })
            ) === 0;

        assertEquals(true, $exercisesNotUnpublishedAndAnonymized, "No unpublished Exercises should remain.");

        // teams
        $teams = $this->entityManager->getRepository(ExercisePhaseTeam::class)->findAll();
        $teamsWithUser = array_filter($teams, function (ExercisePhaseTeam $team) use ($user, $username) {
            $userIsCreator = $team->getCreator() === $user;
            $userIsMember = $team->getMembers()->contains($user);

            return $userIsCreator || $userIsMember;
        });

        assertEquals(0, count($teamsWithUser), "User should not be in any ExercisePhaseTeam.");
    }

    /**
     * @Given Exercise :exerciseId is published
     */
    public function ensureExerciseIsPublished($exerciseId)
    {
        /** @var Exercise $exercise */
        $exercise = $this->entityManager->find(Exercise::class, $exerciseId);
        $exercise->setStatus(Exercise::EXERCISE_PUBLISHED);

        $this->entityManager->persist($exercise);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @When I find videos by creator :userId without cut videos
     */
    public function iFindVideosByCreatorWithoutCutVideos($userId)
    {
        /** @var VideoRepository $videoRepository */
        $videoRepository = $this->entityManager->getRepository(Video::class);
        /** @var User $user */
        $user = $this->entityManager->find(User::class, $userId);

        $this->entityManager->getFilters()->disable('video_doctrine_filter');
        $this->queryResult = $videoRepository->findByCreatorWithoutCutVideos($user);
        $this->entityManager->getFilters()->enable('video_doctrine_filter');
    }

    /**
     * @Then I only receive the regular video :videoId and not the cut video :cutVideoId
     */
    public function iOnlyReceiveTheRegularVideoAndNotTheCutVideo($videoId, $cutVideoId)
    {
        assert(!empty($this->queryResult), 'Query result is empty!');

        $filteredByCutId = array_filter($this->queryResult, function($video) use($cutVideoId) {
            return $video->getId() === $cutVideoId;
        });

        assertEmpty($filteredByCutId, 'Cut video was found. (Should not be part of result!)');

        /** @var Video $firstVideo */
        $firstVideo = current($this->queryResult);
        assertEquals($videoId, $firstVideo->getId());
    }
}
