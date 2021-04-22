@fixtures @removalOfUser
Feature: Degree User is removed completely from system

    Background:
        Given A User "admin@test.de" with the role "ROLE_ADMIN" exists
        And A User "dozent@test.de" with the role "ROLE_DOZENT" exists
        And A User "student1@test.de" with the role "ROLE_STUDENT" exists
        And A User "student2@test.de" with the role "ROLE_STUDENT" exists
        And A Course with ID "course1" exists

    Scenario: Remove Student with Exercise
        Given The User "student1@test.de" has CourseRole "DOZENT" in Course "course1"
        And An Exercise with ID "exerciseByStudent1" created by User "student1@test.de" in Course "course1" exists
        And A Video with ID "video1" created by User "student1@test.de" exists
        # Why
            # log in as admin _after_ Exercise creation
            # Due to the pre_persist of ExerciseEventListener where the creator is set to the logged in user
        And I am logged in as 'admin@test.de'
        When I delete User "student1@test.de"

        Then User "student1@test.de" should not exist
        And No Exercise created by User "student1@test.de" should exist
        And No Video created by User "student1@test.de" should exist
        And No CourseRole of User "student1@test.de" exists

    Scenario: Remove Student with Teams and AutosavedSolutions
        Given The User "dozent@test.de" has CourseRole "DOZENT" in Course "course1"
        And The User "student1@test.de" has CourseRole "STUDENT" in Course "course1"
        And The User "student2@test.de" has CourseRole "STUDENT" in Course "course1"
        And An Exercise with ID "exerciseByDozent" created by User "dozent@test.de" in Course "course1" exists

        And I am logged in as "dozent@test.de"
        And I have an exercise phase "exercisePhase1" belonging to exercise "exerciseByDozent"
        And I have an exercise phase "exercisePhase2" belonging to exercise "exerciseByDozent"

        # Team where student1 is creator and the only member
        And I am logged in as "student1@test.de"
        And I have a team with ID "team1" belonging to exercise phase "exercisePhase1"
        And The User "student1@test.de" is member of ExercisePhaseTeam "team1"
        And The ExercisePhaseTeam "team1" has a Solution "solution1"
        And The User "student1@test.de" has created an AutosavedSolution "autosavedSolution1" for ExercisePhaseTeam "team1"

        # Team where student1 is creator with multiple members
        And I have a team with ID "team2" belonging to exercise phase "exercisePhase2"
        And The User "student1@test.de" is member of ExercisePhaseTeam "team2"
        And The User "student2@test.de" is member of ExercisePhaseTeam "team2"
        And The ExercisePhaseTeam "team2" has a Solution "solution2"
        And The User "student1@test.de" has created an AutosavedSolution "autosavedSolution2" for ExercisePhaseTeam "team2"
        And I am logged in as "student2@test.de"
        And The User "student2@test.de" has created an AutosavedSolution "autosavedSolution3" for ExercisePhaseTeam "team2"

        And I am logged in as "admin@test.de"
        When I delete User "student1@test.de"

        Then User "student1@test.de" should not exist
        And No ExercisePhaseTeam created by User "student1.test.de" should exist
        And No AutosavedSolution of User "student1@test.de" does exist
        And No CourseRole of User "student1@test.de" exists

    Scenario: Remove Admin
        Given A User "admin2@test.de" with the role "ROLE_ADMIN" exists
        And I am logged in as "admin@test.de"
        When I delete User "admin2@test.de"
        Then User "admin2@test.de" should not exist

    Scenario: Remove Dozent
        Given The User "dozent@test.de" has CourseRole "DOZENT" in Course "course1"
        # exerciseByDozent1 and it's content will persist because this exercise will be published
        And An Exercise with ID "exerciseByDozent1" created by User "dozent@test.de" in Course "course1" exists
        # exerciseByDozent2 and it's content will be removed because this exercise will not be published
        And An Exercise with ID "exerciseByDozent2" created by User "dozent@test.de" in Course "course1" exists

        And I am logged in as "dozent@test.de"
        # will persist
        And I have an exercise phase "exercisePhase1" belonging to exercise "exerciseByDozent1"
        And I have a video with ID "video1" belonging to course "course1"
        And A Material with Id "material1" created by User "dozent@test.de" exists for ExercisePhase "exercisePhase1"
        And Exercise "exerciseByDozent1" is published
        # will be removed
        And I have an exercise phase "exercisePhase2" belonging to exercise "exerciseByDozent2"
        And A Video with ID "video2" created by User "dozent@test.de" exists
        And A Material with Id "material2" created by User "dozent@test.de" exists for ExercisePhase "exercisePhase2"

        And I am logged in as "admin@test.de"
        When I delete User "dozent@test.de"
        Then The User "dozent@test.de" is anonymized and their unused content removed
