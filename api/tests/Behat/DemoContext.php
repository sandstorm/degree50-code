<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\Material;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use Behat\Behat\Context\Context;
use Behat\Mink\Session;
use Behat\Mink\WebAssert;
use DAMA\DoctrineTestBundle\Doctrine\DBAL\StaticDriver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

/**
 * This context class contains the definitions of the steps used by the demo
 * feature file. Learn how to get started with Behat and BDD on Behat's website.
 *
 * @see http://behat.org/en/latest/quick_start.html
 */
final class DemoContext implements Context
{

    use DatabaseFixtureContextTrait;

    private Session $minkSession;

    private RouterInterface $router;

    protected EntityManagerInterface $entityManager;
    protected KernelInterface $kernel;
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * DemoContext constructor.
     * @param Session $minkSession
     * @param RouterInterface $router
     * @param EntityManagerInterface $entityManager
     * @param KernelInterface $kernel
     */
    public function __construct(Session $minkSession, RouterInterface $router, EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore, KernelInterface $kernel)
    {
        $this->minkSession = $minkSession;
        $this->router = $router;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
        $this->kernel = $kernel;
    }


    /**
     * @When I visit route :routeName
     */
    public function visitRoute(string $routeName): void
    {
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

    public function assertSession(): WebAssert
    {
        return new WebAssert($this->minkSession);
    }

    /**
     * @Then I am redirected to the login page
     */
    public function iAmRedirectedToTheLoginPage()
    {
        $this->assertSession()->pageTextContains('Sign in');
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
        /* @var $tokenStorage \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface */
        $tokenStorage = $this->kernel->getContainer()->get('security.token_storage');
        $tokenStorage->setToken(null);
    }

    /**
     * @Given I have a video with ID :videoId
     */
    public function iHaveAVideoRememberingItsIDAsVIDEOID($videoId)
    {
        $this->entityManager->persist(new Video($videoId));
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have an exercise with ID :exerciseId
     */
    public function iHaveAnExercise($exerciseId)
    {
        $this->entityManager->persist(new Exercise($exerciseId));
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have a course with ID :courseId
     */
    public function iHaveAnCourseWithID($courseId)
    {
        $this->entityManager->persist(new Course($courseId));
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given I have an exercise phase :exercisePhaseId belonging to exercise :exerciseId
     */
    public function iHaveAnExercisePhaseBelongingToExercise($exercisePhaseId, $exerciseId)
    {
        /* @var $exercise Exercise */
        $exercise = $this->entityManager->find(Exercise::class, $exerciseId);
        $exercise->addPhase(new ExercisePhase($exercisePhaseId));

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
        $material->setLink('link');
        $fileName = tempnam(sys_get_temp_dir(), 'foo');
        file_put_contents($fileName, 'my file');
        $file = new File($fileName);
        $material->setFile($file);

        $this->entityManager->persist($material);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }
}
