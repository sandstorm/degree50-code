<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use App\Entity\Exercise\Exercise;
use App\Entity\Video\Video;
use Behat\Behat\Context\Context;
use Behat\Behat\Tester\Exception\PendingException;
use Behat\Mink\Session;
use Behat\Mink\WebAssert;
use DAMA\DoctrineTestBundle\Doctrine\DBAL\StaticDriver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * This context class contains the definitions of the steps used by the demo
 * feature file. Learn how to get started with Behat and BDD on Behat's website.
 *
 * @see http://behat.org/en/latest/quick_start.html
 */
final class DemoContext implements Context
{

    private Session $minkSession;

    private RouterInterface $router;

    private EntityManagerInterface $entityManager;

    public function __construct(Session $minkSession, RouterInterface $router, EntityManagerInterface $entityManager)
    {
        $this->minkSession = $minkSession;
        $this->router = $router;
        $this->entityManager = $entityManager;
    }


    /**
     * @BeforeSuite
     */
    public static function beforeSuite()
    {
        StaticDriver::setKeepStaticConnections(true);
    }

    /**
     * @BeforeScenario
     */
    public function beforeScenario()
    {
        StaticDriver::beginTransaction();
    }

    /**
     * @AfterScenario
     */
    public function afterScenario()
    {
        StaticDriver::rollBack();
    }

    /**
     * @AfterSuite
     */
    public static function afterSuite()
    {
        StaticDriver::setKeepStaticConnections(false);
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
     * @Given I have a video with ID :videoId
     */
    public function iHaveAVideoRememberingItsIDAsVIDEOID($videoId)
    {
        $this->entityManager->persist(new Video($videoId));
        $this->entityManager->flush();
    }

    /**
     * @Given I have an exercise with ID :exerciseId
     */
    public function iHaveAnExercise($exerciseId)
    {
        $this->entityManager->persist(new Exercise($exerciseId));
        $this->entityManager->flush();
    }
}
