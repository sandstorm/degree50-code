@fixtures @playwright
Feature: I can select components that I want to use in my exercise
    For example, when I create an Analysis Phase, I can select "Annotationen" or "Codierungen" or both.
    Only those components should be active in the ExercisePhase.

    Background:
        Given A User "test-dozent@sandstorm.de" with the role "ROLE_DOZENT" exists
        And A User "test-student@sandstorm.de" with the role "ROLE_STUDENT" exists
        And A Course with ID "course1" exists
        And The User "test-dozent@sandstorm.de" has CourseRole "DOZENT" in Course "course1"
        And The User "test-student@sandstorm.de" has CourseRole "STUDENT" in Course "course1"
        And An Exercise with ID "e1" created by User "test-dozent@sandstorm.de" in Course "course1" exists
        And An ExercisePhase with the following data exists:
            | id        | name      | task      | isGroupPhase | sorting | otherSolutionsAreAccessible | belongsToExercise | dependsOnPhase | type          | videoAnnotationsActive | videoCodesActive |
            | analysis1 | Analysis1 | Analysis1 | false        | 0       | true                        | e1                | null           | videoAnalysis | false                  | false            |
            | analysis2 | Analysis2 | Analysis2 | false        | 1       | true                        | e1                | analysis1      | videoAnalysis | true                   | false            |
            | analysis3 | Analysis3 | Analysis3 | false        | 2       | true                        | e1                | analysis1      | videoAnalysis | false                  | true             |
            | analysis4 | Analysis4 | Analysis4 | false        | 3       | true                        | e1                | analysis1      | videoAnalysis | true                   | true             |
            | analysis5 | Analysis5 | Analysis5 | false        | 4       | true                        | e1                | analysis4      | videoAnalysis | false                  | false            |
            | analysis6 | Analysis6 | Analysis6 | false        | 5       | true                        | e1                | analysis2      | videoAnalysis | false                  | false            |
            | videoCut  | VideoCut  | VideoCut  | false        | 6       | true                        | e1                | analysis3      | videoCutting  | false                  | false            |

        And Exercise "e1" is published

    Scenario: No components are selected
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/analysis1"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be disabled
        And The element with an aria-label starting with text "Codierungen" should be disabled

    Scenario: Only Annotationen are selected
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/analysis2"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be enabled
        And The element with an aria-label starting with text "Codierungen" should be disabled

    Scenario: Only Codierungen are selected
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/analysis3"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be disabled
        And The element with an aria-label starting with text "Codierungen" should be enabled

    Scenario: Both Annotationen and Codierungen are selected
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/analysis4"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be enabled
        And The element with an aria-label starting with text "Codierungen" should be enabled

    Scenario: Both Annotationen and Codierungen are selected in a phase the current phase is depending on
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/analysis5"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be enabled
        And The element with an aria-label starting with text "Codierungen" should be enabled

    Scenario: Only Annotationen is selected in a phase the current phase is depending on
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/analysis6"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be enabled
        And The element with an aria-label starting with text "Codierungen" should be disabled

    Scenario: Only Annotationen is selected in a phase the current phase is depending on
        Given I am logged in via browser as "test-student@sandstorm.de"
        And I visit url "/exercise/e1/phase/videoCut"
        When I click on "Phase starten"
        Then The element with an aria-label starting with text "Annotationen" should be disabled
        And The element with an aria-label starting with text "Codierungen" should be enabled
        And I pause for debugging
