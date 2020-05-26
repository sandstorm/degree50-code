Feature: Redirections to the login if unauthenticated

  Background:
    Given I have a video with ID "foo"
    Given I have an exercise with ID "ex"

  Scenario Outline: Redirections to the login page if we are not authenticated
    When I visit route "<route>" with parameters as JSON '<params>'
    Then I am redirected to the login page
    Then the response status code should be 200

    Examples:
      | route                 | params        |
      | app_exercise-overview |               |
      | app_exercise-new      |               |
      # TODO: here, we do not get a 404, because our Exercise is not returned by Doctrine because of the ExerciseDoctrineFilter
      #| app_exercise-edit     | {"id": "ex"}  |
      | app_subtitle-editor   |               |
      | app_videoplayer       | {"id": "foo"} |
      | app_videoupload       |               |


