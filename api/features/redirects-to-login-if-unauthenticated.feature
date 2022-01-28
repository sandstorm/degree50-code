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

  Scenario Outline: Redirections to the login page if we are not authenticated
    When I visit route "<route>" with parameters as JSON '<params>'
    Then I am redirected to the login page
    Then the response status code should be 200

    Examples:
      | route                                            | params                            |
      | mediathek--index                                 |                                   |
      | mediathek__video--player                         | {"id": "foo"}                     |
      | mediathek__video--upload                         |                                   |
      | mediathek__video--edit                           | {"id": "foo"}                     |
      | mediathek__video--delete                         | {"id": "foo"}                     |
      | exercise-overview__exercise--show-phase-overview | {"id": "ex"}                      |
      | exercise-overview__exercise--show-overview       | {"id": "ex"}                      |
      | exercise-overview__exercise--new                 | {"id": "c"}                       |
      | exercise-overview__exercise--edit                | {"id": "ex"}                      |
      | exercise-overview                                | {"id": "c"}                       |
      | exercise-overview__exercise-phase--new           | {"id": "ex"}                      |
      | exercise-overview__exercise-phase--set-type      | {"id": "ex"}                      |
      | exercise-overview__exercise-phase--edit          | {"id": "ex", "phase_id": "ex-p1"} |
      | exercise-overview__exercise-phase--delete        | {"id": "ex", "phase_id": "ex-p1"} |
      | exercise-overview__material--download            | {"id": "m"}                       |

      # TODO add missing routes!



