@fixtures @schreibtisch
Feature: Students can access their available videos, exercises and materials via a designated "Schreibtisch" view

    @playwright
    Scenario: A student can navigate to the schreibtisch
        Given I am a student logged in via browser
        And I am part of two courses with multiple exercises
        When I navigate to "Schreibtisch"
        Then I get access to "Meine Aufgaben", "Meine Videofavoriten", "Meine Materialien"
        And See my available exercises by default

    @integration
    Scenario: A student can see all exercises of courses they are part of in "Meine Aufgaben"
        Given I am a student
        And I am part of two courses with multiple exercises
        When I access "Meine Aufgaben"
        Then All my available exercises from both courses are shown

    @integration
    Scenario: A student can see their favorite videos in "Videofavoriten"
        Given I am a student
        And I have some video favorites
        When I access "Meine Videofavoriten"
        Then All my favorite videos are shown

    @playwright
    Scenario: A student can add a video to their favorites
        Given I am a student logged in via browser
        When I add a video to my favorite videos
        And I Navigate to "Meine Videofavoriten" on the "Schreibtisch"
        Then I see all my favorite videos

    @playwright
    Scenario: A student can remove a video from their favorites
        Given I am a student logged in via browser
        And I have some video favorites
        When I remove a video from my favorites
        Then I no longer see this video in "Meine Videofavoriten"

    @integration
    Scenario: A student can access their finished materials in "Materialien"
        Given I am a student
        And I have a "Material"
        When I access "Meine Materialien"
        Then My Material is shown

    @playwright
    Scenario: A student can edit their finished materials without altering the original solution
        Given I am a student logged in via browser
        And I have a "Material"
        When I access a material from "Meine Materialien"
        And Edit this material
        Then My changes are persisted
        And The original solution remains untouched


    #############
    # Filtering #
    #############

    @integration
    Scenario: A student can filter their exercises by "Fachbereich"

    @integration
    Scenario: A student can filter their videos by "Fachbereich"

    @integration
    Scenario: A student can filter their materials by "Fachbereich"

    @integration
    Scenario: A student can filter their exercises by "Kurs"

    @integration
    Scenario: A student can filter their videos by "Kurs"

    @integration
    Scenario: A student can filter their materials by "Kurs"
