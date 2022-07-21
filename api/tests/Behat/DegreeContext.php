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
use App\Entity\Exercise\Solution;
use App\Entity\Video\Video;
use App\Entity\Video\VideoFavorite;
use App\Entity\VirtualizedFile;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Controller\ExercisePhaseService;
use App\Exercise\Controller\ExerciseService;
use App\Exercise\Controller\SolutionService;
use App\Mediathek\Service\VideoFavouritesService;
use App\Mediathek\Service\VideoService;
use App\Repository\Account\UserRepository;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\ExerciseRepository;
use App\Service\UserMaterialService;
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
use function PHPUnit\Framework\assertContains;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertTrue;

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
    private VideoFavouritesService $videoFavouritesService;
    private UserMaterialService $materialService;

    private ?string $clientSideJSON;

    /** @var TextFileDto[] $csvDtoList */
    private ?array $csvDtoList;

    private ?array $queryResult;
    private ?ExercisePhase $currentExercisePhase = null;
    private ?Exercise $currentExercise = null;
    private ?User $currentUser = null;

    const TEST_STUDENT = "test-student@sandstorm.de";
    const TEST_DOZENT = "test-dozent@sandstorm.de";
    const TEST_COURSE_1 = "course1";
    const TEST_COURSE_2 = "course2";
    const TEST_EXERCISE_1 = "exercise1";
    const TEST_EXERCISE_2 = "exercise2";
    const TEST_EXERCISE_3 = "exercise3";
    const TEST_EXERCISE_4 = "exercise4";
    const ANALYSIS_PHASE_BASE_ID = 'analysis1';
    const CUT_PHASE_BASE_ID = 'cut1';
    const REFLEXION_PHASE_BASE_ID = 'reflexion1';
    const MATERIAL_PHASE_BASE_ID = 'material1';
    const GROUP_PHASE_BASE_ID = 'groupPhase1';

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
        VideoFavouritesService $videoFavouritesService,
        UserMaterialService $materialService,
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
        $this->videoFavouritesService = $videoFavouritesService;
        $this->materialService = $materialService;

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

        $this->currentUser = $user;
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

    private function createExercisePhaseId(string $exerciseId, string $courseId, string $baseId)
    {
        return $exerciseId . '_' . $courseId . '_' . $baseId;
    }

    private function createExercisePhaseIdForExercise1InCourse1(ExercisePhaseType $exercisePhaseType)
    {
        return $this->createExercisePhaseId(
            self::TEST_EXERCISE_1,
            self::TEST_COURSE_1,
            $this->getTestPhaseIdByType($exercisePhaseType)
        );
    }

    private function createPhaseOfTypeInExercise(
        string $phaseId,
        string $exerciseId,
        ExercisePhaseType $exercisePhaseType,
        bool $isGroupPhase = false,
    ): ExercisePhase {
        return $this->createExercisePhase([
            "type" => $exercisePhaseType->value,
            "id" => $phaseId,
            "name" => $phaseId,
            "task" => "description of analysis1",
            "isGroupPhase" => $isGroupPhase,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => $exerciseId,
            "dependsOnPhase" => false,
            "videoAnnotationsActive" => true,
            "videoCodesActive" => true
        ]);
    }

    private function createExerciseInCourseByUser(string $exerciseId, string $courseId, User $user)
    {
        // Create exercise
        $this->userHasCourseRole($user, CourseRole::DOZENT, $courseId);

        // WHY:
        // This is a hack, because we currently do have a prePersist hook for exercise creation
        // (see ExerciseEventListener). That way the exercise creator will always be set to
        // the user who is currently logged in, no matter what has been set before.
        $this->iAmLoggedInAs($user);
        $this->ensureExerciseByUserInCourseExists($exerciseId, $user, $courseId);
    }

    /**
     * @Given I am a student in a course with an exercise
     * */
    public function iAmACourseStudentWithAnExercise()
    {
        $this->createUser(self::TEST_STUDENT, null, false, true);
        $this->ensureCourseExists(self::TEST_COURSE_1);
        $this->userHasCourseRole(self::TEST_STUDENT, CourseRole::STUDENT, self::TEST_COURSE_1);

        $testDozent = $this->createUser(self::TEST_DOZENT);
        $this->userHasCourseRole($testDozent, CourseRole::DOZENT, self::TEST_COURSE_1);

        $this->createExerciseInCourseByUser(self::TEST_EXERCISE_1, self::TEST_COURSE_1, $testDozent);

        // Create phases
        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::ANALYSIS_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::VIDEO_ANALYSIS
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::CUT_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::VIDEO_CUT
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::VIDEO_CUT,
            true
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::REFLEXION_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::REFLEXION
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::MATERIAL_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::MATERIAL
        );

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
        $exercise = $this->exerciseRepository->find(self::TEST_EXERCISE_1);
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
        $exercisePhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID));
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
        $exercisePhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID));

        assertEquals($exercisePhaseStatus, $this->exercisePhaseService->getStatusForUser($exercisePhase, $user)->value);
    }

    /**
     * @When I enter a group for a group exercise phase
     */
    public function iEnterAGroupForAGroupExercisePhase()
    {
        $exercisePhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID));
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

    private function getTestPhaseIdByType(ExercisePhaseType $phaseType)
    {
        return match ($phaseType) {
            ExercisePhaseType::VIDEO_ANALYSIS => $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::ANALYSIS_PHASE_BASE_ID),
            ExercisePhaseType::VIDEO_CUT => $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::CUT_PHASE_BASE_ID),
            ExercisePhaseType::REFLEXION => $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::REFLEXION_PHASE_BASE_ID),
            ExercisePhaseType::MATERIAL => $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::MATERIAL_PHASE_BASE_ID),
        };
    }

    private function startExercisePhaseForTheFirstTime(string $phaseType)
    {
        $exercisePhaseId = $this->getTestPhaseIdByType(ExercisePhaseType::from($phaseType));
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

        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($user, $exercisePhase);

        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);
    }

    /**
     * @Given I am working on a phase of type :phaseType where a review is required: :reviewIsRequired
     */
    public function iAmWorkingOnAPhaseOfTypeThatHasTheReviewState(string $phaseType, string $reviewIsRequired)
    {
        $exercisePhaseId = $this->getTestPhaseIdByType(ExercisePhaseType::from($phaseType));
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
        $this->ensureCourseExists(self::TEST_COURSE_1);
        $this->userHasCourseRole(self::TEST_STUDENT, CourseRole::STUDENT, self::TEST_COURSE_1);

        // Create exercise
        $this->createUser(self::TEST_DOZENT);
        $this->userHasCourseRole(self::TEST_DOZENT, CourseRole::DOZENT, self::TEST_COURSE_1);

        // WHY:
        // This is a hack, because we currently do have a prePersist hook for exercise creation
        // (see ExerciseEventListener). That way the exercise creator will always be set to
        // the user who is currently logged in, no matter what has been set before.
        $this->iAmLoggedInAs(self::TEST_DOZENT);
        $this->ensureExerciseByUserInCourseExists(self::TEST_EXERCISE_1, self::TEST_DOZENT, self::TEST_COURSE_1);

        // Create phases
        $exercisePhase = $this->createExercisePhase([
            "type" => "material",
            "id" => self::MATERIAL_PHASE_BASE_ID,
            "name" => self::MATERIAL_PHASE_BASE_ID,
            "task" => "description of material1",
            "isGroupPhase" => false,
            "sorting" => 0,
            "otherSolutionsAreAccessible" => true,
            "belongsToExercise" => self::TEST_EXERCISE_1,
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
            $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($student, $phase);
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
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($user, $exercisePhase);
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
        $exercise = $this->exerciseRepository->find(self::TEST_EXERCISE_1);

        assertEquals($status, $this->exerciseService->getExerciseStatusForUser($exercise, $user));
    }

    private function finishPhase(ExercisePhase $exercisePhase, User $user)
    {
        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($user);
        $exercisePhaseTeam->setCreator($user);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        $this->exercisePhaseService->finishPhase($exercisePhaseTeam);
    }

    /**
     * @When I have finished one exercise phase
     */
    public function iHaveFinishedOneExercisePhases()
    {
        $student = $this->userRepository->find(self::TEST_STUDENT);

        $analysisPhase = $this->exercisePhaseRepository->find($this->getTestPhaseIdByType(ExercisePhaseType::VIDEO_ANALYSIS));

        $this->finishPhase($analysisPhase, $student);
    }

    /**
     * @When I have finished all phases of an exercise
     */
    public function iHaveFinishedAllPhasesOfAnExercise()
    {
        $student = $this->userRepository->find(self::TEST_STUDENT);

        $analysisPhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::ANALYSIS_PHASE_BASE_ID));
        $cutPhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::CUT_PHASE_BASE_ID));
        $groupPhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID));
        $reflexionPhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::REFLEXION_PHASE_BASE_ID));
        $materialPhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::MATERIAL_PHASE_BASE_ID));

        foreach ([$analysisPhase, $cutPhase, $groupPhase, $reflexionPhase, $materialPhase] as $exercisePhase) {
            $this->finishPhase($exercisePhase, $student);
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
        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($user, $exercisePhase);
        $exercisePhaseTeam->setStatus($status);

        // open
        $this->exercisePhaseService->openPhase($exercisePhaseTeam);
    }

    /**
     * @Given I am a student logged in via browser
     */
    public function iAmStudentLoggedInViaBrowser()
    {
        $this->currentUser = $this->createUser(self::TEST_STUDENT, null, true, true);

        $this->iAmLoggedInViaBrowserAs(self::TEST_STUDENT);
    }

    private function ensureAnExerciseTeamForUserAndPhaseExists(User $user, ExercisePhase $exercisePhase): ExercisePhaseTeam
    {
        $exercisePhaseTeam = new ExercisePhaseTeam();
        $exercisePhaseTeam->setExercisePhase($exercisePhase);
        $exercisePhaseTeam->addMember($user);
        // NOTE: will be overwritten by "prepersist" hook
        $exercisePhaseTeam->setCreator($user);

        $this->eventStore->addEvent('MemberAddedToTeam', [
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'userId' => $user->getId(),
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        return $exercisePhaseTeam;
    }

    /**
     * @Given I am part of two courses with multiple exercises
     */
    public function iAmPartOfTwoCoursesWithMultipleExercises()
    {
        // WHY: we have to set logged in user to dozent to create exercises
        // so we need to set it to the previously logged in user afterwards
        $previouslyLoggedInUser = $this->currentUser;

        $testDozent = $this->createUser(self::TEST_DOZENT);

        // course 1
        $this->ensureCourseExists(self::TEST_COURSE_1);
        $this->userHasCourseRole($previouslyLoggedInUser, CourseRole::STUDENT, self::TEST_COURSE_1);

        // exercise 1
        $this->createExerciseInCourseByUser(self::TEST_EXERCISE_1, self::TEST_COURSE_1, $testDozent);

        // Create phases
        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::ANALYSIS_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::VIDEO_ANALYSIS
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::CUT_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::VIDEO_CUT
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::VIDEO_CUT,
            true
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::REFLEXION_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::REFLEXION
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::MATERIAL_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::MATERIAL
        );

        // exercise 2
        $this->createExerciseInCourseByUser(self::TEST_EXERCISE_2, self::TEST_COURSE_1, $testDozent);

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_2, self::TEST_COURSE_1, self::ANALYSIS_PHASE_BASE_ID),
            self::TEST_EXERCISE_2,
            ExercisePhaseType::VIDEO_ANALYSIS
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_2, self::TEST_COURSE_1, self::CUT_PHASE_BASE_ID),
            self::TEST_EXERCISE_2,
            ExercisePhaseType::VIDEO_CUT
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_2, self::TEST_COURSE_1, self::GROUP_PHASE_BASE_ID),
            self::TEST_EXERCISE_2,
            ExercisePhaseType::VIDEO_CUT,
            true
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_2, self::TEST_COURSE_1, self::REFLEXION_PHASE_BASE_ID),
            self::TEST_EXERCISE_2,
            ExercisePhaseType::REFLEXION
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_2, self::TEST_COURSE_1, self::MATERIAL_PHASE_BASE_ID),
            self::TEST_EXERCISE_2,
            ExercisePhaseType::MATERIAL
        );

        // course 2
        $this->ensureCourseExists(self::TEST_COURSE_2);
        $this->userHasCourseRole($previouslyLoggedInUser, CourseRole::STUDENT, self::TEST_COURSE_2);

        // exercise 1
        $this->createExerciseInCourseByUser(self::TEST_EXERCISE_3, self::TEST_COURSE_2, $testDozent);

        // Create phases
        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_3, self::TEST_COURSE_2, self::ANALYSIS_PHASE_BASE_ID),
            self::TEST_EXERCISE_3,
            ExercisePhaseType::VIDEO_ANALYSIS
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_3, self::TEST_COURSE_2, self::CUT_PHASE_BASE_ID),
            self::TEST_EXERCISE_3,
            ExercisePhaseType::VIDEO_CUT
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_3, self::TEST_COURSE_2, self::GROUP_PHASE_BASE_ID),
            self::TEST_EXERCISE_3,
            ExercisePhaseType::VIDEO_CUT,
            true
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_3, self::TEST_COURSE_2, self::REFLEXION_PHASE_BASE_ID),
            self::TEST_EXERCISE_3,
            ExercisePhaseType::REFLEXION
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_3, self::TEST_COURSE_2, self::MATERIAL_PHASE_BASE_ID),
            self::TEST_EXERCISE_3,
            ExercisePhaseType::MATERIAL
        );

        // exercise 2
        $this->createExerciseInCourseByUser(self::TEST_EXERCISE_4, self::TEST_COURSE_2, $testDozent);

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_4, self::TEST_COURSE_2, self::ANALYSIS_PHASE_BASE_ID),
            self::TEST_EXERCISE_4,
            ExercisePhaseType::VIDEO_ANALYSIS
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_4, self::TEST_COURSE_2, self::CUT_PHASE_BASE_ID),
            self::TEST_EXERCISE_4,
            ExercisePhaseType::VIDEO_CUT
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_4, self::TEST_COURSE_2, self::GROUP_PHASE_BASE_ID),
            self::TEST_EXERCISE_4,
            ExercisePhaseType::VIDEO_CUT,
            true
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_4, self::TEST_COURSE_2, self::REFLEXION_PHASE_BASE_ID),
            self::TEST_EXERCISE_4,
            ExercisePhaseType::REFLEXION
        );

        $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_4, self::TEST_COURSE_2, self::MATERIAL_PHASE_BASE_ID),
            self::TEST_EXERCISE_4,
            ExercisePhaseType::MATERIAL
        );

        $this->currentUser = $previouslyLoggedInUser;
    }

    /**
     * @When I navigate to "Schreibtisch"
     */
    public function iNavigateToSchreibtisch()
    {
        $this->iClickOnFirstElementWithTestId('header-menu-schreibtisch');
    }

    /**
     * @Then I get access to "Meine Aufgaben", "Meine Videofavoriten", "Meine Materialien"
     */
    public function iGetAccessToSchreibtisch()
    {
        $this->pageContainsTexts(["Meine Aufgaben", "Meine Videofavoriten", "Meine Materialien"]);
    }

    /**
     * @Then See my available exercises by default
     */
    public function seeMyAvailableExercisesByDefault()
    {
        $this->pageContainsTexts([
            self::TEST_EXERCISE_1,
            self::TEST_EXERCISE_2,
            self::TEST_EXERCISE_3,
            self::TEST_EXERCISE_4,
        ]);
    }

    /**
     * @Given I am a student
     */
    public function iAmAStudent()
    {
        $this->iAmLoggedInAs(self::TEST_STUDENT);
    }

    /**
     * @When I access "Meine Aufgaben"
     */
    public function iAccessMeineAufgaben()
    {
        $this->queryResult = $this->exerciseService->getExercisesForUser($this->currentUser);
    }

    /**
     * @When I access "Meine Videofavoriten"
     */
    public function iAccessMeineVideofavoriten()
    {
        $videoFavorites = $this->videoFavouritesService->getFavouriteVideosForUser($this->currentUser);
        $videos = array_map(fn (VideoFavorite $videoFavourite) => $videoFavourite->getVideo(), $videoFavorites);

        $this->queryResult = $videos;
    }

    /**
     * @Then All my available exercises from both courses are shown
     */
    public function allMyAvailableExercisesFromBothCoursesAreShown()
    {
        $results = array_map(fn (Exercise $exercise) => $exercise->getId(), $this->queryResult);
        $expected = [
            self::TEST_EXERCISE_1,
            self::TEST_EXERCISE_2,
            self::TEST_EXERCISE_3,
            self::TEST_EXERCISE_4
        ];

        foreach ($expected as $phaseId) {
            assertContains($phaseId, $results);
        }
    }

    /**
     * @Given I have some video favorites
     */
    public function iHaveSomeVideoFavorites()
    {
        $videos = $this->createExampleVideos();

        $this->videoFavouritesService->addVideoFavouriteForUser($videos[0], $this->currentUser);
        $this->videoFavouritesService->addVideoFavouriteForUser($videos[1], $this->currentUser);
    }

    /**
     * @Then All my favorite videos are shown
     */
    public function allMyFavoriteVideosAreShown()
    {
        /** @var Video[] $result */
        $result = array_map(fn (Video $video) => $video->getId(), $this->queryResult);
        $expected = ["video1", "video2"];

        foreach ($expected as $videoId) {
            assertContains($videoId, $result);
        }
    }

    private function createExampleVideos()
    {
        $actualCurrentUser = $this->currentUser;

        $course = $this->ensureCourseExists(self::TEST_COURSE_1);
        $this->userHasCourseRole(
            $this->currentUser->getId(),
            $this->currentUser->isStudent() ? CourseRole::STUDENT : CourseRole::DOZENT,
            self::TEST_COURSE_1
        );

        // Temporarily switch to dozent user to create videos
        $dozent = $this->createUser(self::TEST_DOZENT);
        $this->userHasCourseRole(self::TEST_DOZENT, CourseRole::DOZENT, self::TEST_COURSE_1);

        // WHY:
        // This is a hack, because we currently do have a prePersist hook for exercise creation
        // (see ExerciseEventListener). That way the exercise creator will always be set to
        // the user who is currently logged in, no matter what has been set before.
        $this->iAmLoggedInAs(self::TEST_DOZENT);

        $videoIdList = ["video1", "video2", "video3"];

        /** @var Video[] $videos */
        $videos = array_map(function ($videoId) use ($dozent, $course) {
            $video = new Video($videoId);
            $video->addCourse($course);
            $this->videoService->persistUploadedVideoFile(
                $video,
                VirtualizedFile::fromString('test'),
                $dozent
            );

            return $video;
        }, $videoIdList);

        $this->currentUser = $actualCurrentUser;

        return $videos;
    }

    /**
     * @When I add a video to my favorite videos
     */
    public function iAddAVideoToMyFavoriteVideos()
    {
        // add other video favorites
        $this->iHaveSomeVideoFavorites();

        assertTrue($this->currentUser->isStudent(), "User is not a student!");

        // navigate to video page in Mediathek
        $this->iClickOnFirstElementWithTestId('header-menu-mediathek');
        // open tile menu
        $this->iClickOnFirstElementWithTestId('video-tile--video3');
        // click "zu Favoriten hinzufügen" button
        $this->iClickOnFirstElementWithTestId('add-video-to-favorites--video3');
    }

    /**
     * @When I Navigate to "Meine Videofavoriten" on the "Schreibtisch"
     */
    public function iNavigateToMeineVideofavoritenOnTheSchreibtisch()
    {
        $this->iNavigateToSchreibtisch();
        $this->iClickOn('Meine Videofavoriten');

        // Because we have an async request for favorites going on that might not
        // yet have resolved, we need to wait until our loading spinner is no longer shown
        $this->waitForSelector('video-favorites');
    }

    /**
     * @Then I see all my favorite videos
     */
    public function iSeeAllMyFavoriteVideos()
    {
        $this->pageContainsTexts([
            'video1',
            'video2',
            'video3',
        ]);
    }

    /**
     * @When I remove a video from my favorites
     */
    public function iRemoveAVideoFromMyFavorites()
    {

        assertTrue($this->currentUser->isStudent(), "User is not a student!");

        // navigate to video page in Mediathek
        $this->iClickOnFirstElementWithTestId('header-menu-mediathek');
        // open tile menu
        $this->iClickOnFirstElementWithTestId('video-tile--video1');
        // click "zu Favoriten hinzufügen" button
        $this->iClickOnFirstElementWithTestId('remove-video-from-favorites--video1');
    }

    /**
     * @Then I no longer see this video in "Meine Videofavoriten"
     */
    public function iNoLongerSeeThisVideoIn()
    {
        $this->iNavigateToMeineVideofavoritenOnTheSchreibtisch();

        $this->pageContainsTexts([
            'video2',
        ]);

        $this->pageNotContainTexts([
            'video1',
        ]);
    }

    /**
     * @Given I have a "Material"
     */
    public function iHaveAMaterial()
    {
        $user = $this->currentUser;
        $testDozent = $this->createUser(self::TEST_DOZENT);

        // course
        $this->ensureCourseExists(self::TEST_COURSE_1);
        // courseRole
        $this->userHasCourseRole($user, CourseRole::STUDENT, self::TEST_COURSE_1);

        // exercise
        $this->createExerciseInCourseByUser(self::TEST_EXERCISE_1, self::TEST_COURSE_1, $testDozent);

        // material phase
        $materialPhase = $this->createPhaseOfTypeInExercise(
            $this->createExercisePhaseId(self::TEST_EXERCISE_1, self::TEST_COURSE_1, self::MATERIAL_PHASE_BASE_ID),
            self::TEST_EXERCISE_1,
            ExercisePhaseType::MATERIAL
        );

        // WHY: we have to set logged in user to dozent to create exercises
        // so we need to set it to the previously logged in user afterwards
        $this->currentUser = $user;

        $exercisePhaseTeam = $this->ensureAnExerciseTeamForUserAndPhaseExists($user, $materialPhase);

        // create solution
        $solution = new Solution('solution1', '<p>test material</p>');

        // add solution to team
        $exercisePhaseTeam->setSolution($solution);

        $this->eventStore->addEvent('SolutionShared', [
            'exercisePhaseId' => $materialPhase->getId(),
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'solutionId' => $solution->getId()
        ]);

        $this->entityManager->persist($solution);
        $this->entityManager->persist($exercisePhaseTeam);
        $this->entityManager->flush();

        $this->materialService->createMaterialForUser($user, $exercisePhaseTeam, 'material1');
    }

    /**
     * @When I access "Meine Materialien"
     */
    public function iAccessMeineMaterialien()
    {
        $this->queryResult = $this->materialService->getMaterialsForUser($this->currentUser);
    }

    /**
     * @Then My Material is shown
     */
    public function myMaterialIsShown()
    {
        /** @var UserMaterial $result */
        $result = array_map(fn ($material) => $material->getId(), $this->queryResult)[0];
        $expected = 'material1';

        assertEquals($expected, $result);
    }

    /**
     * @When I access a material from "Meine Materialien"
     */
    public function iAccessAMaterialFrom()
    {
        $this->iNavigateToSchreibtisch();
        $this->iClickOnFirstElementWithTestId('meine-materialien');
    }

    /**
     * @When Edit this material
     */
    public function editThisMaterial()
    {
        // open editor
        $this->iClickOnFirstElementWithTestId('edit--material1');
        // edit material
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                await vars.page.fill('data-test-id=edit-content', '<p>updated material</p>')
                await vars.page.click('data-test-id=save-material')
            "
        );
    }

    /**
     * @Then My changes are persisted
     */
    public function myChangesArePersisted()
    {
        // we already reloaded by clicking the "Speicher" button
        $this->pageContainsTexts([
            '<p>updated material</p>',
        ]);

        $this->pageNotContainTexts([
            '<p>test material</p>',
        ]);
    }

    /**
     * @Then The original solution remains untouched
     */
    public function theOriginalSolutionRemainsUntouched()
    {
        // get team's solution
        $exercisePhase = $this->exercisePhaseRepository->find($this->createExercisePhaseId(
            self::TEST_EXERCISE_1,
            self::TEST_COURSE_1,
            self::MATERIAL_PHASE_BASE_ID,
        ));

        $exercisePhaseTeam = $this->exercisePhaseTeamRepository->findByMemberAndExercisePhase($this->currentUser, $exercisePhase);
        $actual = $exercisePhaseTeam->getSolution()->getSolution()->getMaterial()->toString();

        $expected = '<p>test material</p>';

        assertEquals($expected, $actual);
    }
}
