@fixtures @integration
Feature: Track phase and exercise status through editing process

        ##########
        # PHASES #
        ##########

    Scenario: The student has not yet started the phase of a non group phase
        Given I am a student in a course with an exercise
        When I have not yet started an exercise phase
        Then The derived exercise phase status of the first phase should be "INITIAL"

    Scenario: The student is not yet part of a group of a group phase
        Given I am a student in a course with an exercise
        When I am not part of a group for a group exercise phase
        Then The derived exercise phase status of the group phase should be "INITIAL"

    Scenario: The student enters a group of a group phase
        Given I am a student in a course with an exercise
        When I enter a group for a group exercise phase
        Then My exercise phase status of the group phase should be "IN_BEARBEITUNG"

    Scenario: The student starts the phase
        Given I am a student in a course with an exercise
        When I start an exercise phase for the first time
        Then The exercise phase status should be "IN_BEARBEITUNG"

    Scenario Outline: The student finishes a phase
        Given I am a student in a course with an exercise
        And I am working on a phase of type "<phaseType>" where <reviewIsRequired>
        When I finish the exercise phase
        Then The exercise phase status should be "<phaseStatus>"

        Examples:
            | phaseType     | phaseStatus | reviewIsRequired |
            | videoAnalysis | BEENDET     | no               |
            | videoCutting  | BEENDET     | no               |
            | reflexion     | BEENDET     | no               |
            | material      | BEENDET     | no               |
            | material      | IN_REVIEW   | yes              |

    Scenario: A dozent finishes the review of a material phase
        Given I am a dozent in a course with a material phase to review
        When I finish the review of a solution of a material phase
        Then The exercise phase status should be "BEENDET"

    Scenario: A student re-visits an already finished exercise phase
        Given I am a student in a course with an exercise
        When I open an exercise phase with status "BEENDET"
        Then The exercise phase status should be "IN_BEARBEITUNG"

    Scenario: A student re-visits an already finished exercise phase of type material
        Given I am a student in a course with an exercise
        When I open a material exercise phase with status "BEENDET"
        Then The exercise phase status should be "BEENDET"

    Scenario: A student re-visits an exercise phase of type material which is currently being reviewed
        Given I am a student in a course with an exercise
        When I open a material exercise phase with status "IN_REVIEW"
        Then The exercise phase status should be "IN_REVIEW"


        ############
        # Exercise #
        ############

    Scenario: The exercise has not been started by the student, yet
        Given I am a student in a course with an exercise
        When I have not yet started an exercise phase
        Then The derived exercise status should be "NEU"

    Scenario: The student has at least one phase of an exercise "IN_BEARBEITUNG"
        Given I am a student in a course with an exercise
        When I have started at least one exercise phase
        Then The derived exercise status should be "IN_BEARBEITUNG"

    Scenario: The student has finished all phases of an exercise
        Given I am a student in a course with an exercise
        When I have finished all phases of an exercise
        Then The derived exercise status should be "BEENDET"
