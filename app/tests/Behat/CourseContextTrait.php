<?php

namespace App\Tests\Behat;

use App\Domain\Course\Model\Course;
use App\Domain\CourseRole\Model\CourseRole;
use App\Domain\User\Model\User;
use Doctrine\ORM\EntityManagerInterface;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertFalse;
use function PHPUnit\Framework\assertNotNull;

trait CourseContextTrait
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    )
    {
    }

    /**
     * Creates a new course with the given ID and adds a course role "DOZENT"
     * for the currently logged in user (use the according step to log in first)
     *
     * @Given I have a course with ID :courseId
     */
    public function iHaveACourseWithIDForUser($courseId): void
    {
        $course = new Course($courseId);
        $course->setName($courseId);
        $courseRole = new CourseRole();
        $courseRole->setUser($this->currentUser);
        $courseRole->setCourse($course);
        $courseRole->setName(CourseRole::DOZENT);

        $this->entityManager->persist($courseRole);

        $course->addCourseRole($courseRole);

        $this->entityManager->persist($course);
        $this->entityManager->flush();
    }

    /**
     * Ensures a course with the given ID exists without any course roles
     *
     * @Given A Course with ID :courseId exists
     */
    public function ensureCourseExists($courseId): Course
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        if (!$course) {
            $course = new Course($courseId);
            $course->setName($courseId);

            $this->entityManager->persist($course);
            $this->entityManager->flush();
        }

        return $course;
    }

    /**
     * @Then The Course :courseId does exist
     */
    public function theCourseWithIdDoesExist($courseId): void
    {
        $course = $this->entityManager->find(Course::class, $courseId);
        assertNotNull($course);
    }

    /**
     * @Then The Course :courseId does not exist
     */
    public function theCourseWithIdDoesNotExist($courseId): void
    {
        /** @var Course|null $course */
        $course = $this->entityManager->find(Course::class, $courseId);
        assertEquals(null, $course);
    }

    /**
     * @When I reset the Course :courseId
     */
    public function iResetTheCourse(string $courseId): void
    {
        $course = $this->entityManager->find(Course::class, $courseId);
        $this->courseService->resetCourse($course);
    }

    /**
     * @Then The User :userId is not assigned to Course :courseId
     */
    public function theUserIsNotAssignedToCourse(string $userId, string $courseId): void
    {
        $course = $this->entityManager->find(Course::class, $courseId);
        assertNotNull($course, "Course with ID $courseId does not exist");
        $user = $this->entityManager->find(User::class, $userId);
        assertNotNull($user, "User with ID $userId does not exist");


        $courseRolesOfUser = $course->getCourseRoles()->exists(function ($key, CourseRole $courseRole) use ($user) {
            return $courseRole->getUser() === $user;
        });

        assertFalse($courseRolesOfUser, "User with ID $userId is still assigned to Course with ID $courseId");
    }
}
