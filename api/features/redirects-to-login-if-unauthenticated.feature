@fixtures
Feature: Redirections to the login if unauthenticated

  Background:
    Given I am logged in as "foo@bar.de"
    Given I have a course with ID "c"
    Given I have an exercise with ID "ex" belonging to course "c"
    Given I have an exercise phase "ex-p1" belonging to exercise "ex"
    Given I have a video with ID "foo" belonging to course "c"
    Given I have a material with ID "m"
    Given I am not logged in

  Scenario: Simple login
    When I visit route "app_exercise-new"
    Then I am redirected to the login page
    Then the response status code should be 200

  Scenario Outline: Redirections to the login page if we are not authenticated
    When I visit route "<route>" with parameters as JSON '<params>'
    Then I am redirected to the login page
    Then the response status code should be 200

    Examples:
      | route                             | params                            |
      | app_mediathek-index               |                                   |
      | app_subtitle-editor               | {"id": "foo"}                                  |
      | app_videoplayer                   | {"id": "foo"}                     |
      | app_videoupload                   |                                   |
      | app_video-edit                    | {"id": "foo"}                     |
      | app_video-delete                  | {"id": "foo"}                     |
      | app_exercise                      | {"id": "ex"}                      |
      | app_exercise-new                  |                                   |
      | app_exercise-edit                 | {"id": "ex"}                      |
      | app_exercise-overview             |                                   |
      | app_exercise-overview-show-course | {"id": "c"}                       |
      | app_exercise-phase-new            | {"id": "ex"}                      |
      | app_exercise-phase-new-set-type   | {"id": "ex"}                      |
      | app_exercise-phase-edit           | {"id": "ex", "phase_id": "ex-p1"} |
      | app_exercise-phase-delete         | {"id": "ex", "phase_id": "ex-p1"} |
      | app_material-download             | {"id": "m"}                       |




