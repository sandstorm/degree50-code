<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use App\Admin\Controller\UserService;
use App\DataExport\Controller\DegreeDataToCsvService;
use App\DataExport\Controller\Dto\TextFileDto;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\MaterialPhase;
use App\Entity\Exercise\ExerciseStatus;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ExercisePhaseService;
use App\Exercise\Controller\ExerciseService;
use App\Exercise\Controller\SolutionService;
use App\Mediathek\Service\VideoService;
use App\Repository\Account\UserRepository;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\ExerciseRepository;
use Behat\Behat\Context\Context;
use Behat\Behat\Tester\Exception\PendingException;
use Behat\Mink\Session;
use Doctrine\ORM\EntityManagerInterface;
use Sandstorm\E2ETestTools\Tests\Behavior\Bootstrap\PlaywrightTrait;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Security;
use function PHPUnit\Framework\assertEquals;

require_once(__DIR__ . '/AttachmentContextTrait.php');
require_once(__DIR__ . '/CourseContextTrait.php');
require_once(__DIR__ . '/CsvContextTrait.php');
require_once(__DIR__ . '/ExerciseContextTrait.php');
require_once(__DIR__ . '/ExercisePhaseContextTrait.php');
require_once(__DIR__ . '/PlaywrightContextTrait.php');
require_once(__DIR__ . '/UserContextTrait.php');
require_once(__DIR__ . '/VideoContextTrait.php');

/**
 * This context class contains the definitions of the steps used by the demo
 * feature file. Learn how to get started with Behat and BDD on Behat's website.
 *
 * @see http://behat.org/en/latest/quick_start.html
 */
final class DegreeContext implements Context
{

    use DatabaseFixtureContextTrait;
    use PlaywrightTrait;


    /*
     * Subcontexts
     */
    use AttachmentContextTrait;
    use CourseContextTrait;
    use CsvContextTrait;
    use ExerciseContextTrait;
    use ExercisePhaseContextTrait;
    use PlaywrightContextTrait;
    use UserContextTrait;
    use VideoContextTrait;

    private Session $minkSession;
    private RouterInterface $router;
    protected EntityManagerInterface $entityManager;
    protected KernelInterface $kernel;
    private DoctrineIntegratedEventStore $eventStore;
    private Security $security;
    private SolutionService $solutionService;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private ExerciseRepository $exerciseRepository;
    private DegreeDataToCsvService $degreeDataToCSVService;
    private UserService $userService;
    private VideoService $videoService;
    private ExerciseService $exerciseService;
    private UserPasswordHasherInterface $userPasswordHasher;
    private UserRepository $userRepository;
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExercisePhaseService $exercisePhaseService;

    private ?string $clientSideJSON;

    /** @var TextFileDto[] $csvDtoList */
    private ?array $csvDtoList;

    private ?array $queryResult;
    private ?ExercisePhase $currentExercisePhase = null;
    private ?Exercise $currentExercise = null;

    const TEST_STUDENT = "test-student";
    const TEST_DOZENT = "test-dozent";
    const TEST_COURSE = "test-course";
    const TEST_EXERCISE = "test-exercise";

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
        ExerciseService $exerciseService,
        UserPasswordHasherInterface $userPasswordHasher,
        ExercisePhaseRepository $exercisePhaseRepository,
        UserRepository $userRepository,
        ExerciseRepository $exerciseRepository,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        ExercisePhaseService $exercisePhaseService,
    ) {
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
        $this->userPasswordHasher = $userPasswordHasher;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->userRepository = $userRepository;
        $this->exerciseRepository = $exerciseRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->exercisePhaseService = $exercisePhaseService;

        $this->setupPlaywright();
    }


    /**
     * @Given I am logged in as :username
     */
    public function iAmLoggedInAs($username)
    {
        $user = $this->entityManager->find(User::class, $username);
        if (!$user) {
            $user = $this->createUser($username);
        }

        // create security token in tokenStorage and set user
        /** @var $tokenStorage TokenStorageInterface */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $tokenStorage->setToken(new UsernamePasswordToken($username, 'foo', 'foo'));
        $tokenStorage->getToken()->setUser($user);
    }

    /**
     * @Given I am not logged in
     */
    public function iAmNotLoggedIn()
    {
        /** @var TokenStorageInterface $tokenStorage */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $tokenStorage->setToken(null);
    }

    /**
     * @Given I am a student in a course with an exercise
     * */
    public function iAmACourseStudentWithAnExercise()
    {
        $this->createUser(self::TEST_STUDENT);
        $this->ensureCourseExists(self::TEST_COURSE);
        $this->userHasCourseRole(self::TEST_STUDENT, CourseRole::STUDENT, self::TEST_COURSE);

        // Create exercise
        $this->createUser(self::TEST_DOZENT);
        $this->userHasCourseRole(self::TEST_DOZENT, CourseRole::DOZENT, self::TEST_COURSE);

        // WHY:
        // This is a hack, because we currently do have a prePersist hook for exercise creation
        // (see ExerciseEventListener). That way the exercise creator will always be set to
        // the user who is currently logged in, no matter what has been set before.
        $this->iAmLoggedInAs(self::TEST_DOZENT);
        $this->ensureExerciseByUserInCourseExists(self::TEST_EXERCISE, self::TEST_DOZENT, self::TEST_COURSE);

        // Create phases
        $this->createExercisePhase([
            "type" => "videoAnalysis",
            "id" => "analysis1",
            "name" => "analysis1",
            "task" => "description of analysis1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE,
            "dependsOnPhase" => false,
            "videoAnnotationsActive" => true,
            "videoCodesActive" => true
        ]);
        $this->createExercisePhase([
            "type" => "videoCutting",
            "id" => "cut1",
            "name" => "cut1",
            "task" => "description of cut1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE,
            "dependsOnPhase" => false,
        ]);
        $this->createExercisePhase([
            "type" => "videoCutting",
            "id" => "groupPhase1",
            "name" => "groupPhase1",
            "task" => "groupPhase1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE,
            "dependsOnPhase" => false,
        ]);
        $this->createExercisePhase([
            "type" => "reflexion",
            "id" => "reflexion1",
            "name" => "reflexion1",
            "task" => "description of reflexion1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE,
            "dependsOnPhase" => false,
        ]);
        $this->createExercisePhase([
            "type" => "material",
            "id" => "material1",
            "name" => "material1",
            "task" => "description of material1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE,
            "dependsOnPhase" => false,
        ]);

        // Log in as the actual user we want to progress further with
        $this->iAmLoggedInAs(self::TEST_STUDENT);
    }

    /**
     * @When I have not yet started an exercise phase
     */
    public function iHaveNotYetStartedAnExercisePhase()
    {
        $this->assertExercisePhaseTeamsCreatedByUserDoNotExist(self::TEST_STUDENT);
    }

    /**
     * @Then The derived exercise phase status of the first phase should be :exercisePhaseStatus
     */
    public function theDerivedExercisePhaseStatusOfTheFirstPhaseShouldBe(string $exercisePhaseStatus)
    {
        $exercise = $this->exerciseRepository->find(self::TEST_EXERCISE);
        $exercisePhase = $this->exercisePhaseRepository->findFirstExercisePhase($exercise);
        $user = $this->userRepository->find(self::TEST_STUDENT);

        $actualExercisePhaseStatus = $this->exercisePhaseService->getStatusForUser($exercisePhase, $user);
        assertEquals($exercisePhaseStatus, $actualExercisePhaseStatus->value);
    }

    /**
     * @Then The derived exercise phase status of the group phase should be :exercisePhaseStatus
     */
    public function theDerivedExercisePhaseStatusOfTheGroupPhaseShouldBe(string $exercisePhaseStatus)
    {
        $exercisePhase = $this->exercisePhaseRepository->find('groupPhase1');
        $user = $this->userRepository->find(self::TEST_STUDENT);

        $actualExercisePhaseStatus = $this->exercisePhaseService->getStatusForUser($exercisePhase, $user);
        assertEquals($exercisePhaseStatus, $actualExercisePhaseStatus->value);
    }

    /**
     * @When I am not part of a group for a group exercise phase
     */
    public function iAmNotPartOfAGroupForAGroupExercisePhase()
    {
        $this->assertExercisePhaseTeamsCreatedByUserDoNotExist(self::TEST_STUDENT);
    }

    /**
     * @Then My exercise phase status of the group phase should be :exercisePhaseStatus
     */
    public function myExercisePhaseStatusOfTheGroupPhaseShouldBe(string $exercisePhaseStatus)
    {
        $user = $this->userRepository->find(self::TEST_STUDENT);
        $exercisePhase = $this->exercisePhaseRepository->find('groupPhase1');

        assertEquals($exercisePhaseStatus, $this->exercisePhaseService->getStatusForUser($exercisePhase, $user)->value);
    }

    /**
     * @When I enter a group for a group exercise phase
     */
    public function iEnterAGroupForAGroupExercisePhase()
    {
        $exercisePhase = $this->exercisePhaseRepository->find('groupPhase1');
        $user = $this->userRepository->find(self::TEST_STUDENT);

        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($user);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();
    }

    /**
     * @Then The exercise phase status should be :exercisePhaseStatus
     */
    public function theExercisePhaseStatusShouldBe(string $exercisePhaseStatus)
    {
        $user = $this->userRepository->find(self::TEST_STUDENT);
        $exercisePhase = $this->currentExercisePhase;

        assertEquals($exercisePhaseStatus, $this->exercisePhaseService->getStatusForUser($exercisePhase, $user)->value);
    }

    /**
     * @When I start an exercise phase for the first time
     */
    public function iStartAnExercisePhaseForTheFirstTime()
    {
        $this->startExercisePhaseForTheFirstTime(ExercisePhaseType::VIDEO_ANALYSIS->value);
    }

    private function getTestPhaseByType(string $phaseTypeString)
    {
        $phaseType = ExercisePhaseType::from($phaseTypeString);

        return match ($phaseType) {
            ExercisePhaseType::VIDEO_ANALYSIS => 'analysis1',
            ExercisePhaseType::VIDEO_CUT => 'cut1',
            ExercisePhaseType::REFLEXION => 'reflexion1',
            ExercisePhaseType::MATERIAL => 'material1',
        };
    }

    private function startExercisePhaseForTheFirstTime(string $phaseType)
    {
        $exercisePhaseId = $this->getTestPhaseByType($phaseType);
        $exercisePhase = $this->exercisePhaseRepository->find($exercisePhaseId);
        $user = $this->userRepository->find(self::TEST_STUDENT);

        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($user);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        $this->currentExercisePhase = $exercisePhase;
    }

    /**
     * @When I finish the exercise phase
     */
    public function iFinishTheExercisePhase()
    {
        $exercisePhase = $this->currentExercisePhase;
        $user = $this->userRepository->find(self::TEST_STUDENT);

        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);

        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);
    }

    /**
     * @Given I am working on a phase of type :phaseType where :reviewIsRequired
     */
    public function iAmWorkingOnAPhaseOfTypeThatHasTheReviewState(string $phaseType, string $reviewIsRequired)
    {
        $exercisePhase = match (ExercisePhaseType::tryFrom($phaseType)) {
            ExercisePhaseType::VIDEO_ANALYSIS => $this->exercisePhaseRepository->find('analysis1'),
            ExercisePhaseType::VIDEO_CUT => $this->exercisePhaseRepository->find('cut1'),
            ExercisePhaseType::REFLEXION => $this->exercisePhaseRepository->find('reflexion1'),
            ExercisePhaseType::MATERIAL => $this->exercisePhaseRepository->find('material1'),
            default => throw new \InvalidArgumentException("Invalid ExercisePhaseType '$phaseType'")
        };

        $user = $this->userRepository->find(self::TEST_STUDENT);

        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($user);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);


        if ($exercisePhase instanceof MaterialPhase) {
            $reviewRequired = $reviewIsRequired === 'yes';
            $exercisePhase->setReviewRequired($reviewRequired);

            $this->eventStore->addEvent('MaterialExercisePhaseEdited', [
                'exercisePhaseId' => $exercisePhase->getId(),
                'name' => $exercisePhase->getName(),
                'task' => $exercisePhase->getTask(),
                'isGroupPhase' => $exercisePhase->isGroupPhase(),
                'dependsOnPreviousPhase' => $exercisePhase->getDependsOnExercisePhase() !== null,
                'components' => $exercisePhase->getComponents(),
                'reviewRequired' => $reviewRequired,
            ]);

            $this->entityManager->persist($exercisePhase);
        }

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        // WHY: Persist current ExercisePhase that the user is working on in context
        $this->currentExercisePhase = $exercisePhase;
    }

    /**
     * @Given I am a dozent in a course with a material phase to review
     */
    public function iAmADozentInACourseWithAMaterialPhaseToReview()
    {
        $student = $this->createUser(self::TEST_STUDENT);
        $this->ensureCourseExists(self::TEST_COURSE);
        $this->userHasCourseRole(self::TEST_STUDENT, CourseRole::STUDENT, self::TEST_COURSE);

        // Create exercise
        $this->createUser(self::TEST_DOZENT);
        $this->userHasCourseRole(self::TEST_DOZENT, CourseRole::DOZENT, self::TEST_COURSE);

        // WHY:
        // This is a hack, because we currently do have a prePersist hook for exercise creation
        // (see ExerciseEventListener). That way the exercise creator will always be set to
        // the user who is currently logged in, no matter what has been set before.
        $this->iAmLoggedInAs(self::TEST_DOZENT);
        $this->ensureExerciseByUserInCourseExists(self::TEST_EXERCISE, self::TEST_DOZENT, self::TEST_COURSE);

        // Create phases
        $exercisePhase = $this->createExercisePhase([
            "type" => "material",
            "id" => "material1",
            "name" => "material1",
            "task" => "description of material1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE,
            "dependsOnPhase" => false,
        ]);

        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($student);
        $exercisePhaseTeam->setCreator($student);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $student->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);


        if ($exercisePhase instanceof MaterialPhase) {
            $exercisePhase->setReviewRequired(true);
        }

        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        // WHY: Persist current ExercisePhase that the user is working on in context
        $this->currentExercisePhase = $exercisePhase;
    }

    /**
     * @When I finish the review of a solution of a material phase
     **/
    public function iFinishTheReviewOfAMaterialPhase()
    {
        $phase = $this->currentExercisePhase;

        if ($phase instanceof MaterialPhase) {
            $student = $this->userRepository->find(self::TEST_STUDENT);
            $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMember($student, $phase);
            $this->exercisePhaseService->finishReview($exercisePhaseTeam);
        }
    }

    /**
     * @When I open an exercise phase with status :phaseStatus
     */
    public function iOpenAnExercisePhaseWithStatus($phaseStatus)
    {
        $status = ExercisePhase\ExercisePhaseStatus::tryFrom($phaseStatus);

        $this->iStartAnExercisePhaseForTheFirstTime();

        $exercisePhase = $this->currentExercisePhase;
        $user = $this->userRepository->find(self::TEST_STUDENT);

        // state setzen
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);
        $exercisePhaseTeam->setStatus($status);

        // open
        $this->exercisePhaseService->openPhase($exercisePhaseTeam);
    }

    /**
     * @When I am part of a course
     */
    public function iAmPartOfACourse()
    {
        throw new PendingException();
    }

    /**
     * @When I have started at least one exercise phase
     */
    public function iHaveStartedAtLeastOneExercisePhase()
    {
        $this->iStartAnExercisePhaseForTheFirstTime();
    }

    /**
     * @Then The derived exercise status should be :exerciseStatus
     */
    public function theDerivedExerciseStatusShouldBe(string $exerciseStatus)
    {
        $status = ExerciseStatus::tryFrom($exerciseStatus);
        $user = $this->userRepository->find(self::TEST_STUDENT);
        $exercise = $this->exerciseRepository->find(self::TEST_EXERCISE);

        assertEquals($status, $this->exerciseService->getExerciseStatusForUser($exercise, $user));
    }

    /**
     * @When I have finished all phases of an exercise
     */
    public function iHaveFinishedAllPhasesOfAnExercise()
    {
        $student = $this->userRepository->find(self::TEST_STUDENT);

        $analysisPhase = $this->exercisePhaseRepository->find('analysis1');
        $cutPhase = $this->exercisePhaseRepository->find('cut1');
        $reflexionPhase = $this->exercisePhaseRepository->find('reflexion1');
        $materialPhase = $this->exercisePhaseRepository->find('material1');

        foreach ([$analysisPhase, $cutPhase, $reflexionPhase, $materialPhase] as $exercisePhase) {
            $exercisePhaseTeam = new ExercisePhaseTeam();
            $exercisePhaseTeam->setExercisePhase($exercisePhase);
            $exercisePhaseTeam->addMember($student);
            $exercisePhaseTeam->setCreator($student);

            $this->eventStore->addEvent('MemberAddedToTeam', [
                'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
                'userId' => $student->getId(),
                'exercisePhaseId' => $exercisePhase->getId()
            ]);

            $this->entityManager->persist($exercisePhaseTeam);
            $this->entityManager->flush();

            $this->exercisePhaseService->finishPhase($exercisePhaseTeam);
        }
    }

    /**
     * @When I open a material exercise phase with status :phaseStatus
     */
    public function iOpenAMaterialExercisePhaseWithStatus(string $phaseStatus)
    {
        $status = ExercisePhase\ExercisePhaseStatus::tryFrom($phaseStatus);

        $this->startExercisePhaseForTheFirstTime('material');

        $exercisePhase = $this->currentExercisePhase;
        $user = $this->userRepository->find(self::TEST_STUDENT);

        // state setzen
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMember($user, $exercisePhase);
        $exercisePhaseTeam->setStatus($status);

        // open
        $this->exercisePhaseService->openPhase($exercisePhaseTeam);
    }
}
