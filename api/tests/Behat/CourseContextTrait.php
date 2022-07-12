<?php

namespace App\Tests\Behat;

use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;

/**
 *
 */
trait CourseContextTrait
{

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
     * @Given A Course with ID :courseId exists
     */
    public function ensureCourseExists($courseId)
    {
        /** @var Course $course */
        $course = $this->entityManager->find(Course::class, $courseId);

        if (!$course) {
            $course = new Course($courseId);
            $course->setName($courseId);

            $this->entityManager->persist($course);
            $this->eventStore->disableEventPublishingForNextFlush();
            $this->entityManager->flush();
        }
    }
}
