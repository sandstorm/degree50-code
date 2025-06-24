@fixtures
Feature: Courses can be reset - removing all Students, Teams and Solutions

    Background:
        Given A User "admin@test.de" with the role "ROLE_ADMIN" exists
        And A User "dozent@test.de" with the role "ROLE_DOZENT" exists
        And A User "student1@test.de" with the role "ROLE_STUDENT" exists
        And A User "student2@test.de" with the role "ROLE_STUDENT" exists

        And A Course with ID "course1" exists

        And The User "dozent@test.de" has CourseRole "DOZENT" in Course "course1"
        And The User "student1@test.de" has CourseRole "DOZENT" in Course "course1"

        And An Exercise with ID "exercise1" created by User "dozent@test.de" in Course "course1" exists
        And The Exercise with ID "exercise1" has assigned Users:
            | student1@test.de |
            | student2@test.de |
        And An ExercisePhase with the following data exists:
            | id             | name  | task                          | isGroupPhase | sorting | otherSolutionsAreAccessible | belongsToExercise | dependsOnPhase | type          | videoAnnotationsActive | videoCodesActive |
            | exercisePhase1 | Test1 | Description of ExercisePhase1 | true         | 0       | true                        | exercise1         | null           | videoAnalysis | true                   | true             |
        And A Video with Id "video1" created by User "dozent@test.de" exists
        And An ExercisePhaseTeam "team1" belonging to exercise phase "exercisePhase1" created by "student1@test.de" exists
        And The User "student2@test.de" is member of ExercisePhaseTeam "team1"
        And The ExercisePhaseTeam "team1" has a Solution "solution1"
        And A CutVideo with Id "cutVideo" of Video "video1" belonging to Solution "solution1" exists

        And An Exercise with ID "exerciseByStudent1" created by User "student1@test.de" in Course "course1" exists
        And An ExercisePhase with the following data exists:
            | id             | name  | task                          | isGroupPhase | sorting | otherSolutionsAreAccessible | belongsToExercise  | dependsOnPhase | type          | videoAnnotationsActive | videoCodesActive |
            | exercisePhase2 | Test2 | Description of ExercisePhase2 | true         | 0       | true                        | exerciseByStudent1 | null           | videoAnalysis | true                   | true             |
        And An ExercisePhaseTeam "team2" belonging to exercise phase "exercisePhase2" created by "student1@test.de" exists
        And The User "student2@test.de" is member of ExercisePhaseTeam "team2"
        And The ExercisePhaseTeam "team2" has a Solution "solution2"
        And I am logged in as "student2@test.de"
        And I have an auto saved solution with ID "autosavedSolution" belonging to team "team2" with solutionData as JSON
        """
            {
              "annotations": [],
              "videoCodes": [],
              "customVideoCodesPool": [],
              "cutList": [
                  {
                      "start": "00:01:03.315",
                      "end": "00:01:30.000",
                      "text": "Cut 1",
                      "memo": "",
                      "color": null,
                      "offset": 0,
                      "playbackRate": "1"
                  }
              ]
            }
        """

    @integration
    Scenario: Reset Course as Dozent
        Given I am logged in as "dozent@test.de"
        When I reset the Course "course1"
        Then The team "team1" is deleted
        And The team "team2" is deleted
        And The Solution "solution1" is deleted
        And The Solution "solution2" is deleted
        And No CutVideo of original "video1" exists
        And The User "student1@test.de" is not assigned to Course "course1"
        And The User "student2@test.de" is not assigned to Course "course1"
        And The Exercise "exerciseByStudent1" does not exist
        And The Exercise "exercise1" exists
        And The Exercise "exercise1" should not have any assigned users

    @playwright
    Scenario: Reset Course as Admin
        Given I am logged in via browser as "admin@test.de"
        When I click on "course1"
        And I click on "Kurs verwalten"
        And I click on "Kurs zurücksetzen" and confirm the confirmation dialog
        Then the page contains all the following texts:
            | Kurs wurde erfolgreich zurückgesetzt! |
            | course1                               |
        When I click on "Kurs verwalten"
        And I click on "Lernende verwalten"
        Then the page contains all the following texts:
            | 0 Lernende |

    @playwright
    Scenario: Reset Course should not be available for Students
        Given I am logged in via browser as "student1@test.de"
        When I click on "course1"
        Then the page should not contain the text "Kurs zurücksetzen"

    @playwright
    Scenario: Reset Course should fail for Students
        Given I am logged in via browser as "student1@test.de"
        When I visit url "/course/reset/course1"
        Then the page should contain the text "Zugriff verweigert"
