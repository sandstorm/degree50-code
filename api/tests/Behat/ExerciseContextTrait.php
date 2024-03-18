<?php

namespace App\Tests\Behat;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Repository\Exercise\ExerciseRepository;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertSame;

/**
 *
 */
trait ExerciseContextTrait
{
    /**
     * TODO: setting status is only possible when the Exercise has at least one ExercisePhase (via UI)
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
     * @Given An Exercise with the following data exists:
     */
    public function assureAnExerciseWithTheFollowingDataExists(TableNode $tableNode)
    {
        $exerciseData = $tableNode->getHash()[0];
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $exerciseData['course']);
        /** @var User $creator */
        $creator = $this->entityManager->find(User::class, $exerciseData['creator']);

        $exercise = new Exercise($exerciseData['id']);
        $exercise->setName($exerciseData['name']);
        $exercise->setDescription($exerciseData['description']);
        $exercise->setCreator($creator);
        $exercise->setCourse($course);

        $this->entityManager->persist($exercise);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given An Exercise with the following json-data exists:
     *
     * This is just another way to use the step above, because oftentimes configuring
     * the step via JSON is much more convenient and easier to read for large data sets.
     */
    public function assureAnExerciseWithTheFollowingJsonDataExists(PyStringNode $exerciseDataJson)
    {
        $exerciseData = json_decode($exerciseDataJson->getRaw(), true);
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $exerciseData['course']);
        /** @var User $creator */
        $creator = $this->entityManager->find(User::class, $exerciseData['creator']);

        $exercise = new Exercise($exerciseData['id']);
        $exercise->setName($exerciseData['name']);
        $exercise->setDescription($exerciseData['description']);
        $exercise->setCreator($creator);
        $exercise->setCourse($course);
        $exercise->setStatus($exerciseData['status']);

        $this->entityManager->persist($exercise);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
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

        $exercise->setName($exerciseId);
        $exercise->setCreator($user);
        $exercise->setStatus(2);
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
            function (Exercise $exercise) use ($username) {
                return $exercise->getCreator()->getUsername() === $username;
            }
        );

        assertEquals(0, count($exercisesCreatedByUser));
    }

    /**
     * @Given Course :courseId belongs to exercise :exerciseId
     */
    public function courseWithIdBelongsToExercise($courseId, $exerciseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        /** @var Exercise $exercise */
        $exercise = $this->entityManager->find(Exercise::class, $exerciseId);

        $exercise->setCourse($course);
        $course->addExercise($exercise);

        $this->entityManager->persist($exercise);
        $this->entityManager->persist($course);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * Creates an exercise for the currently logged in user (use the according step to log in first)
     *
     * @Given I have an exercise with ID :exerciseId belonging to course :courseId
     */
    public function iHaveAnExercise($exerciseId, $courseId): void
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        $exercise = new Exercise($exerciseId);
        $exercise->setCourse($course);
        $exercise->setCreator($this->currentUser);
        $course->addExercise($exercise);

        $this->entityManager->persist($exercise);
        $this->entityManager->persist($course);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @When I delete the exercise :exerciseId
     */
    public function iDeleteTheExercise($exerciseId): void
    {
        $exercise = $this->exerciseRepository->find($exerciseId);
        assertSame($exerciseId, $exercise->getId());
        assertSame($this->currentUser->getUsername(), $exercise->getCreator()->getUsername());
        $this->exerciseService->deleteExercise($exercise);
    }

    /**
     * @Then The exercise :exerciseId is deleted
     */
    public function theExerciseShouldIsDeleted($exerciseId): void
    {
        $exercise = $this->exerciseRepository->find($exerciseId);
        assertEquals(null, $exercise);
    }

    /**
     * @Then The exercise :exerciseId exists
     */
    public function theExerciseExists($exerciseId): void
    {
        $exercise = $this->exerciseRepository->find($exerciseId);
        assertSame($exerciseId, $exercise->getId());
    }
}
