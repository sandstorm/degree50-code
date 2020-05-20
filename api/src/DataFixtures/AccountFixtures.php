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
        $course = new Course();
        $course->setName('Seminar Mathe 1');

        $account = new User();
        $account->setEmail('admin@sandstorm.de');
        $account->setPassword($this->passwordEncoder->encodePassword($account, 'password'));

        $courseRole = new CourseRole();
        $courseRole->setName('Dozent');
        $courseRole->setCourse($course);
        $courseRole->setUser($account);

        $manager->persist($account);
        $manager->flush();
    }
}
