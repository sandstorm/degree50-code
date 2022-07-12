<?php

namespace App\Tests\Behat;

use Behat\Gherkin\Node\TableNode;

use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertStringContainsString;
use function PHPUnit\Framework\assertStringNotContainsString;
use function PHPUnit\Framework\assertTrue;

/**
 *
 */
trait PlaywrightContextTrait
{
    /**
     * @When I visit url :routeName
     */
    public function visitUrl(string $url): void
    {
        $this->playwrightConnector->execute($this->playwrightContext, sprintf(
            // language=JavaScript
            '
            if (!vars.page) {
                vars.page = await context.newPage()
            }
            // TODO write first goto and then waitforNavigation
            const response = await vars.page.goto(`BASEURL%s`)

            // save response in context
            vars.response = response
            ' // language=PHP
            ,
            $url
        ));
    }

    /**
     * @Then the response status code should be :code
     */
    public function assertResponseStatus(int $code)
    {
        $actual = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            '
            return vars.response.status();
            '
        );

        assertEquals($code, $actual);
    }

    /**
     * @Then I am redirected to the login page
     */
    public function iAmRedirectedToTheLoginPage()
    {
        $this->thePageShouldContainTheText('Login mit Uni-Account (SSO)');
    }

    /**
     * @Given I am logged in via browser as :username
     */
    public function iAmLoggedInViaBrowserAs($username)
    {
        $this->playwrightConnector->execute($this->playwrightContext, sprintf(
            // language=JavaScript
            '
            vars.page = await context.newPage();
            await vars.page.goto("BASEURL/login");

            await vars.page.fill(`[name="email"]`, `%s`);
            await vars.page.fill(`[name="password"]`, `password`);

            await Promise.all([
                vars.page.waitForNavigation(),
                vars.page.click(`button[type="submit"]`),
            ])
        ' // language=PHP
            ,
            $username
        ));
    }

    private function getPageContent(): string
    {
        $content = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            '
                return await vars.page.content();
            '
        );

        return $content;
    }

    /**
     * @Then the page should contain the text :text
     */
    public function thePageShouldContainTheText($text)
    {
        $content = $this->getPageContent();

        assertStringContainsString($text, $content);
    }

    /**
     * @Then the page should not contain the text :text
     */
    public function thePageShouldNotContainTheText($text)
    {
        $content = $this->getPageContent();

        assertStringNotContainsString($text, $content);
    }

    /**
     * @Then the page contains all the following texts:
     */
    public function thePageContainsAllTheFollowingTexts(TableNode $tableNode)
    {
        $content = $this->getPageContent();

        foreach ($tableNode->getColumn(0) as $text) {
            assertStringContainsString($text, $content);
        }
    }

    /**
     * @Then the page contains none of the following texts:
     */
    public function thePageContainsNoneTheFollowingTexts(TableNode $tableNode)
    {
        $content = $this->getPageContent();

        foreach ($tableNode->getColumn(0) as $text) {
            assertStringNotContainsString($text, $content);
        }
    }

    /**
     * @Given I fill out the course form and submit
     */
    public function iFillOutTheCourseFormAndSubmit()
    {
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                await vars.page.fill(`input#course_name`, `Test-Kurs`)
                await vars.page.selectOption(`select#course_users`, { index: 0 })
                await vars.page.click(`button#course_save`)
            "
        );
    }

    /**
     * @Given I click on :innerText
     */
    public function iClickOn($innerText)
    {
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                await vars.page.click(`text=${innerText}`)
            "
        );
    }

    /**
     * @When I click on first element with testId :testId
     */
    public function iClickOnFirstElementWith($testId)
    {
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                await vars.page.click('data-test-id=$testId')
            "
        );
    }

    /**
     * @Given I submit the form
     */
    public function iSubmitTheForm()
    {
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            '
                await vars.page.click(`[type="submit"]`)
            '
        );
    }

    /**
     * @Then I should be able to download the CSV export for :entityId when clicking on :label
     */
    public function iShouldBeAbleToDownloadCsvExport($entityId, $label)
    {
        $url = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                const [ download ] = await Promise.all(
                    [
                        vars.page.waitForEvent('download'),
                        vars.page.click(`[role='button']:has-text('{$label}'), button:has-text('{$label}'), .btn:has-text('{$label}'), a:has-text('{$label}')`)
                    ]
                )
                const path = await download.url()

                return path
            "
        );

        assertStringContainsString($entityId, $url);
    }

    /**
     * @Given I fill out the exercise form and submit
     */
    public function iFillOutTheExerciseFormAndSubmit()
    {
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                await vars.page.fill(`input#exercise_name`, `Test-Aufgabe`)
                // here we have to use this way to navigate to the description field because we use ckeditor
                await vars.page.keyboard.press('Tab')
                await vars.page.keyboard.type('Test-Aufgaben-Beschreibung')

                await vars.page.click(`button#exercise_save`)
            "
        );
    }

    /**
     * @When I select the nth :index element with testId :testId
     */
    public function iSelectTheNthElementWithTestId(int $index, string $testId)
    {
        $hasElement = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                const element = await vars.page.locator('data-test-id=$testId >> nth=$index')
                vars.selectedElement = element

                return !!element
            "
        );

        assertTrue($hasElement);
    }

    /**
     * @Then the selected element should have its attribute :attribute set to value :expectedValue
     */
    public function theSelectedElementShouldHaveAttributeSetToValue(string $attribute, string $expectedValue)
    {
        $actual = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                return vars.selectedElement.getAttribute('$attribute')
            "
        );

        assertEquals($actual, $expectedValue);
    }

    /**
     * @Then I click on the selected element
     */
    public function iClickOnTheSelectedElement()
    {
        $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                vars.selectedElement.click()
            "
        );
    }

    /**
     * @Then :count elements of selectedElement type should exist
     */
    public function numberOfElementsShouldExist($count)
    {
        $actual = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                return vars.selectedElement.count()
            "
        );

        assertEquals($count, $actual);
    }

    /**
     * @Then The selected element should have the CSS-class :cssClass
     */
    public function selectedElementShouldHaveCssClass($cssClass)
    {
        $actualClasses = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                return await vars.selectedElement.getAttribute('class')
            "
        );

        assertTrue(str_contains($actualClasses, $cssClass));
    }

    /**
     * @Then The selected element should not have the CSS-class :cssClass
     */
    public function selectedElementShouldNotHaveCssClass($cssClass)
    {
        $actualClasses = $this->playwrightConnector->execute(
            $this->playwrightContext,
            // language=JavaScript
            "
                return await vars.selectedElement.getAttribute('class')
            "
        );

        assertTrue(!str_contains($actualClasses, $cssClass));
    }

    /**
     * @When I visit route :routeName
     */
    public function visitRoute(string $routeName): void
    {
        $url = $this->router->generate($routeName);

        $this->visitUrl($url);
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

        $url = $this->router->generate($routeName, $parameters);

        $this->visitUrl($url);
    }
}
