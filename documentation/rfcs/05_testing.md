# Testing Strategy

(suggestion, not yet decided)

## TestCafe vs Selenium

Selenium is the "old kid on the block", where tests can be written in any language.
TestCafe https://devexpress.github.io/testcafe/ is a framework we have good experiences with.


**Pros Selenium**:

- De-Facto-Standard
- Tests can be written in PHP / Behat (e.g. with https://github.com/symfony/panther); thus easier integration with PHP fixture-setup-code. This is especially
  relevant for mutating testcases which change state.
-  Possible to write Tests in BDD (Behat) first-class supported.

**Cons Selenium**:

- I have not yet experienced a project where setting up Selenium was not painful, and we were able to maintain
  Selenium tests over a longer timeframe. (HUGE DRAWBACK)
  
  
**Pros TestCafe**

- we have experience with it (in the company AND in the Neos project), and it works really reliably
- mobile testing seems to be better (though we do not know this 1st hand); see https://devexpress.github.io/testcafe/faq/#i-have-heard-that-testcafe-does-not-use-selenium-how-does-it-operate
- Integration with Axe (accessibility checker) really easy: https://github.com/helen-dikareva/axe-testcafe
- Tests easy to write in a stable way (e.g. auto-wait on AJAX calls)
- Good "interactive debugging" tools (e.g. step through test one by one)
- Good, centralized, exhaustive documentation

**Cons TestCafe**

- BDD would only possible through extra plugins
    - see https://github.com/kiwigrid/gherkin-testcafe
    - Fun Fact / Discussion: https://github.com/kiwigrid/gherkin-testcafe/issues/7#issuecomment-527156997
    - if using TestCafe, I would **embrace writing the Tests in TypeScript** with good reusable method calls.
- For setting up the test fixtures, we need to call into Symfony commands via CLI. (doable and not a big issue I'd say)


**Cypress** is an alternative to testcafe; but we don't have experience with that; so we wouldn't recommend this. 


## Suggestion

- Use TestCafe
- Write Tests in TypeScript https://devexpress.github.io/testcafe/documentation/test-api/typescript-support.html
- Setup of fixtures via Symfony CLI commands https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#initialization-and-clean-up

