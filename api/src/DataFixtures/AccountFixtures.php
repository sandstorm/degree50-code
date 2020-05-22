<?php

namespace App\DataFixtures;

use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AccountFixtures extends Fixture
{
    public const COURSE_REFERENCE = 'course';

    /**
     * @var UserPasswordEncoderInterface
     */
    private $passwordEncoder;

    public function __construct(UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->passwordEncoder = $passwordEncoder;
    }

    public function load(ObjectManager $manager)
    {
        // add one course for admin
        $course = new Course();
        $course->setName('Seminar Mathe 1');
        $manager->persist($course);

        // other fixtures can get this object using the AccountFixtures::COURSE_REFERENCE constant
        $this->addReference(self::COURSE_REFERENCE, $course);

        $account = new User();
        $account->setEmail('admin@sandstorm.de');
        $account->setPassword($this->passwordEncoder->encodePassword($account, 'password'));
        $manager->persist($account);

        $courseRole = new CourseRole();
        $courseRole->setName('DOZENT');
        $courseRole->setCourse($course);
        $courseRole->setUser($account);
        $manager->persist($courseRole);

        // add second course for admin
        $course2 = new Course();
        $course2->setName('Seminar Mathe 2');
        $manager->persist($course2);

        $courseRole2 = new CourseRole();
        $courseRole2->setName('DOZENT');
        $courseRole2->setCourse($course2);
        $courseRole2->setUser($account);
        $manager->persist($courseRole2);

        // student user
        $account2 = new User();
        $account2->setEmail('student@sandstorm.de');
        $account2->setPassword($this->passwordEncoder->encodePassword($account2, 'password'));
        $manager->persist($account2);

        $courseRole3 = new CourseRole();
        $courseRole3->setName('STUDENT');
        $courseRole3->setCourse($course);
        $courseRole3->setUser($account2);
        $manager->persist($courseRole3);

        $manager->flush();
    }
}
