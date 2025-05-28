@fixtures @playwright @debug
Feature: Redirections to the login if unauthenticated

    Background:
        Given I am logged in as "foo@bar.de"
        And I have a course with ID "c"
        And I have an exercise with ID "ex" belonging to course "c"
        And I have an exercise phase "ex-p1" belonging to exercise "ex"
        And I have a team with ID "team-1" belonging to exercise phase "ex-p1"
        And A Video with Id "foo" created by User "foo@bar.de" exists
        And the Video with Id "foo" is added to Course "c"
        And An Attachment with Id "m" created by User "foo@bar.de" exists for ExercisePhase "ex-p1"
        And I am not logged in

    Scenario Outline: Redirections to the login page if we are not authenticated
        When I visit route "<route>" with parameters as JSON '<params>'
        Then I am redirected to the login page
        And the response status code should be 200

        Examples:
            | route                      | params                            |
            | app                        |                                   |
            | app_data-privacy           |                                   |
            | app_terms-of-use           |                                   |
            | mediathek--index           |                                   |
            | mediathek__video--player   | {"id": "foo"}                     |
            | mediathek__video--upload   |                                   |
            | mediathek__video--edit     | {"id": "foo"}                     |
            | mediathek__video--delete   | {"id": "foo"}                     |
            | exercise__show-phase       | {"id": "ex"}                      |
            | exercise__show             | {"id": "ex"}                      |
            | exercise__new              | {"id": "c"}                       |
            | exercise__edit             | {"id": "ex"}                      |
            | courses                    |                                   |
            | exercise-phase__show       | {"id": "ex", "team_id": "team-1"} |
            | exercise-phase__test       | {"id": "ex", "team_id": "team-1"} |
            | exercise-phase__reset-test | {"id": "ex", "team_id": "team-1"} |
            | exercise-phase__new        | {"id": "ex"}                      |
            | exercise-phase__set-type   | {"id": "ex"}                      |
            | exercise-phase__edit       | {"id": "ex", "phase_id": "ex-p1"} |
            | exercise-phase__delete     | {"id": "ex", "phase_id": "ex-p1"} |
            | attachment--download       | {"id": "m"}                       |
            | attachment--delete         | {"id": "m"}                       |
            | attachment--list           | {"id": "m"}                       |
            | course                     |                                   |
            | course                     | {"id": "c"}                       |
            | course--members            | {"id": "c"}                       |
            | course--new                |                                   |
            | course--edit               | {"id": "c"}                       |
            | course--delete             | {"id": "c"}                       |
