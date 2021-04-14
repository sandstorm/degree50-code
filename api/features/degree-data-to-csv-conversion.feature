@fixtures @conversionToCSV
Feature: Degree data (courses, solutions etc.) is converted into csv data

    Scenario: Conversion of all degree data for a single course
        Given I am logged in as "foo@bar.de"
        # Implies that the user also has the "DOZENT" role for this course
        Given I have a course with ID "course-1"
        Given I have an exercise with ID "exercise-1" belonging to course "course-1"
        Given I have an exercise phase "ex-p1" belonging to exercise "exercise-1"
        Given I have a team with ID "team-1" belonging to exercise phase "ex-p1"
        Given A user "testuser@bar.de" exists
        Given User "testuser@bar.de" belongs to "team-1"
        Given I have a predefined videoCodePrototype belonging to execise phase "ex-p1" and with properties
            | id        | name  | description | color     |
            | foo_bar   | Foo   | FooBar      | #ffffff   |
        Given I have a solution with ID "solution-1" belonging to team with ID "team-1" with solutionLists as JSON
            """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Annotation 1 - and now comes a line break \n and here is a carriage return \r",
                  "memo": "",
                  "color": null
                }
              ],
              "videoCodes": [
                {
                  "start": "00:02:18.453",
                  "end": "00:02:45.000",
                  "text": "VideoCode 1",
                  "memo": "Ein Memo",
                  "color": "#ff9300",
                  "idFromPrototype": "1605544765106_#ff9300"
                },
                {
                  "start": "00:00:01.000",
                  "end": "00:00:04.000",
                  "text": "VideoCode 2",
                  "memo": "",
                  "color": "#ffffff",
                  "idFromPrototype": "foo_bar"
                }
              ],
              "customVideoCodesPool": [
                {
                  "id": "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                  "name": "Verschiedene Arten der Beteiligung und der Motivation",
                  "description": "",
                  "color": "#ff9300",
                  "userCreated": false,
                  "videoCodes": [
                    {
                      "id": "1605544765106_#ff9300",
                      "name": "Lob; Kompliment",
                      "description": "",
                      "color": "#ff9300",
                      "userCreated": true,
                      "videoCodes": []
                    }
                  ]
                }
              ],
              "cutList": [
                  {
                      "start": "00:01:03.315",
                      "end": "00:01:30.000",
                      "text": "Cut 1",
                      "memo": "",
                      "color": null,
                      "url": "test",
                      "offset": "00:01:03.315",
                      "playbackRate": "1"
                  }
              ]
            }
            """
        Given I have a cut video "cut-video-1" belonging to solution "solution-1"
        When I convert all data for "course-1" to csv
        Then I have a CSVDto-list containing a file "solutions.csv" with a CSV content string
        """
        id|courseId|courseName|exerciseId|exerciseName|exerciseDescription|exerciseCreatedAt|exerciseStatus|phaseId|isGroupPhase|phaseName|phaseTask|phaseDefinition|phaseType|dependsOnPreviousPhase|teamId|teamCreator
        solution-1|course-1||exercise-1|||27.04.2021|created|ex-p1|0||||videoAnalysis|0|team-1|foo@bar.de

        """
        Then I have a CSVDto-list containing a file "courseUsers.csv" with a CSV content string
        """
        courseId|courseName|role|user
        course-1||DOZENT|foo@bar.de

        """
        Then I have a CSVDto-list containing a file "teamUsers.csv" with a CSV content string
        """
        userId|user|teamId|creatorId|solutionId
        testuser@bar.de|testuser@bar.de|team-1|foo@bar.de|solution-1

        """
        # Note how we check that line breaks/carriage returns are being replaced correctly during this step!
        Then I have a CSVDto-list containing a file "annotations.csv" with a CSV content string
        """
        solutionId|start|end|text|memo|color
        solution-1|00:01:03.315|00:01:30.000|"Annotation 1 - and now comes a line break   and here is a carriage return  "||

        """
        Then I have a CSVDto-list containing a file "videoCodes.csv" with a CSV content string
        """
        solutionId|start|end|text|memo|color|prototypeId|prototypeName|prototypeDescription|prototypeColor|prototypeParentId|isUserCreatedPrototype
        solution-1|00:02:18.453|00:02:45.000|"VideoCode 1"|"Ein Memo"|#ff9300|1605544765106_#ff9300|"Lob; Kompliment"||#ff9300||yes
        solution-1|00:00:01.000|00:00:04.000|"VideoCode 2"||#ffffff|foo_bar|||||

        """
        Then I have a CSVDto-list containing a file "cuts.csv" with a CSV content string
        """
        solutionId|start|end|text|memo|color|url|offset|playbackRate
        solution-1|00:01:03.315|00:01:30.000|"Cut 1"|||test|0|1

        """
