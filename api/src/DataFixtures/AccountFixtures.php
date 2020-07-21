<?php

namespace App\DataFixtures;

use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AccountFixtures extends Fixture
{
    public const COURSE_REFERENCE = 'course';
    public const CREATOR_REFERENCE = 'creator';

    /**
     * @var UserPasswordEncoderInterface
     */
    private $passwordEncoder;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(UserPasswordEncoderInterface $passwordEncoder, DoctrineIntegratedEventStore $eventStore)
    {
        $this->passwordEncoder = $passwordEncoder;
        $this->eventStore = $eventStore;
    }

    public function load(ObjectManager $manager)
    {
        $course = $this->createCourse($manager, 'Seminar Mathe 1');
        $course2 = $this->createCourse($manager, 'Seminar Mathe 2');

        // other fixtures can get this object using the AccountFixtures::COURSE_REFERENCE constant
        $this->addReference(self::COURSE_REFERENCE, $course);

        $dozent = $this->createUser($manager, 'admin@sandstorm.de', ['ROLE_ADMIN']);
        $this->addReference(self::CREATOR_REFERENCE, $dozent);

        $this->createCourseRole($manager, CourseRole::DOZENT, $course, $dozent);
        $this->createCourseRole($manager, CourseRole::DOZENT, $course2, $dozent);

        // student user
        $student = $this->createUser($manager, 'student@sandstorm.de');
        $this->createCourseRole($manager, CourseRole::STUDENT, $course, $student);

        $student2 = $this->createUser($manager, 'student2@sandstorm.de');
        $this->createCourseRole($manager, CourseRole::STUDENT, $course, $student2);

        $this->eventStore->disableEventPublishingForNextFlush();
        $manager->flush();
    }

    private function createUser(ObjectManager $manager, string $userName, $roles = []): User
    {
        $account = new User();
        $account->setEmail($userName);
        $account->setRoles($roles);
        $account->setPassword($this->passwordEncoder->encodePassword($account, 'password'));
        $manager->persist($account);

        return $account;
    }

    private function createCourse(ObjectManager $manager, string $name): Course
    {
        $course = new Course();
        $course->setName($name);
        $manager->persist($course);

        return $course;
    }

    private function createCourseRole(ObjectManager $manager, string $name, Course $course, User $user): CourseRole
    {
        $courseRole = new CourseRole();
        $courseRole->setName($name);
        $courseRole->setCourse($course);
        $courseRole->setUser($user);
        $manager->persist($courseRole);

        return $courseRole;
    }
}
