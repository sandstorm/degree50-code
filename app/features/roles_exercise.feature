@fixtures @playwright
Feature: Roles and constraints regarding [viewing | creating | editing | deletion | testing | viewing Solutions] of Exercises

    # role constrains on exercise entity
    #
    # NOTE:
    #   * Exercises can only be published (via UI) if the Exercise has at least one ExercisePhase (not neccessary via repository!)
    #   * Published Exercises without ExercisePhase are hidden from students
    #
    # admin can
    #   * create, view, edit, delete, test exercises in all courses
    #   * view solutions for all exercises in all courses
    # dozent can
    #   * create, view, edit, delete, test exercises in assigned courses
    #   * view solutions for all exercises in assigned courses
    # student can
    #   * view exercises in assigned courses if (he/she created them) or (they are published & have at least one ExercisePhase)
    #   * create exercises in courses where he/she is KursDozent
    #   * edit, delete, test created exercises
    #   * view solutions for created exercises
    #
    #   ┌──────────┬────────────────────────────────────────────────────────────────────────────────┬──────────────────┬──────────────┬──────────────┬──────────────┬──────────────────┐
    #   │  Action  │        View                                                                    │       Create     │  Edit        │  Delete      │  Test        │  View Solutions  │
    #   ├──────────┼────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────────┼──────────────┼──────────────┼──────────────────┤
    #   │  admin   │  ALL                                                                           │  In All courses  │  ALL         │  ALL         │  ALL         │  ALL             │
    #   ├──────────┼────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────────┼──────────────┼──────────────┼──────────────────┤
    #   │  dozent  │  KursDozent                                                                    │  KursDozent      │  KursDozent  │  KursDozent  │  KursDozent  │  KursDozent      │
    #   ├──────────┼────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────────┼──────────────┼──────────────┤──────────────────┤
    #   │  student │  Created | (veröffentlicht & (KursStudent | KursDozent) & Exercise has Phase)  │  KursDozent      │  Created     │  Created     │  Created     │  Created         │
    #   └──────────┴────────────────────────────────────────────────────────────────────────────────┴──────────────────┴──────────────┴──────────────┴──────────────┘──────────────────┘
    #

    Background:
        Given A User "test-admin@sandstorm.de" with the role "ROLE_ADMIN" exists
        And A User "test-dozent@sandstorm.de" with the role "ROLE_DOZENT" exists
        And A User "test-student@sandstorm.de" with the role "ROLE_STUDENT" exists

        And A Course with ID "course1" exists
        And A Course with ID "course2" exists
        And A Course with ID "course3" exists

        And The User "test-dozent@sandstorm.de" has CourseRole "DOZENT" in Course "course1"
        And The User "test-student@sandstorm.de" has CourseRole "STUDENT" in Course "course1"
        And The User "test-student@sandstorm.de" has CourseRole "DOZENT" in Course "course2"

        And An Exercise with ID "c1-exercise-admin" created by User "test-admin@sandstorm.de" in Course "course1" exists
        And An Exercise with ID "c1-exercise-admin-unpublished" created by User "test-admin@sandstorm.de" in Course "course1" exists
        And An Exercise with ID "c1-exercise-dozent" created by User "test-dozent@sandstorm.de" in Course "course1" exists

        And An Exercise with ID "c2-exercise-student" created by User "test-student@sandstorm.de" in Course "course2" exists
        And An Exercise with ID "c2-exercise-admin" created by User "test-admin@sandstorm.de" in Course "course2" exists

        And An Exercise with ID "c3-exercise-admin" created by User "test-admin@sandstorm.de" in Course "course3" exists

        And Exercise "c1-exercise-dozent" is published
        And Exercise "c1-exercise-admin" is published
        And I have an exercise phase "c1-exercise-admin-phase" belonging to exercise "c1-exercise-admin"
        And Exercise "c2-exercise-admin" is published
        And Exercise "c3-exercise-admin" is published

    #########################
    ### View
    #########################
    Scenario: As admin I can see all courses
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I visit route "courses"
        Then the page contains all the following texts:
            | course1 |
            | course2 |
            | course3 |

    Scenario: As admin I can see all exercises of course1
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | c1-exercise-admin             |
            | c1-exercise-admin-unpublished |
            | c1-exercise-dozent            |

    Scenario: As admin I can see all exercises of course2
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | c2-exercise-student |
            | c2-exercise-admin   |

    Scenario: As admin I can see all exercises of course3
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course3"
        Then the page contains all the following texts:
            | c3-exercise-admin |

    Scenario: As dozent I can see all courses I am Dozent for
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I visit route "courses"
        Then the page contains all the following texts:
            | course1 |
        And the page contains none of the following texts:
            | course2 |
            | course3 |

    Scenario: As dozent I can see all exercises of courses I am KursDozent for
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | c1-exercise-admin             |
            | c1-exercise-admin-unpublished |
            | c1-exercise-dozent            |

    Scenario: As student I can see all courses I am KursStudent or KursDozent of
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I visit route "courses"
        Then the page contains all the following texts:
            | course1 |
            | course2 |
        And the page contains none of the following texts:
            | course3 |

    Scenario: As student I can see my created exercises of courses I am KursDozent for - course2
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | c2-exercise-student |

    Scenario: As student I can see published exercises of courses I am KursStudent for - course1
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | c1-exercise-admin |
        And the page contains none of the following texts:
            | c1-exercise-admin-unpublished |
            # has no phases
            | c1-exercise-dozent            |

    #########################
    ### Create
    #########################
    Scenario Outline: As admin I can create an exercise in all courses
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I visit url "/course/<courseId>"
        And I click on "Neue Aufgabe anlegen"
        And I fill out the exercise form and submit
        Then the response status code should be 200
        And the page should contain the text "Aufgabe erfolgreich angelegt!"
        And the page should contain the text "Test-Aufgabe"

        Examples:
            | courseId |
            | course1  |
            | course2  |
            | course3  |

    Scenario: As dozent I can create an exercise in assigned courses
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I visit url "/course/course1"
        And I click on "Neue Aufgabe anlegen"
        And I fill out the exercise form and submit
        Then the response status code should be 200
        And the page should contain the text "Aufgabe erfolgreich angelegt!"
        And the page should contain the text "Test-Aufgabe"

    Scenario Outline: As dozent I can not create an exercise in unassigned courses
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I visit url "/exercise/new/<courseId>"
        Then the response status code should be 403
        And the page should contain the text "Zugriff verweigert"

        Examples:
            | courseId |
            | course2  |
            | course3  |

    Scenario: As student I can create an exercise courses where I am KursDozent
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I visit url "/course/course2"
        And I click on "Neue Aufgabe anlegen"
        And I fill out the exercise form and submit
        Then the response status code should be 200
        And the page should contain the text "Aufgabe erfolgreich angelegt!"
        And the page should contain the text "Test-Aufgabe"

    Scenario Outline: As student I can not create an exercise in courses where I am not KursDozent
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I visit url "/exercise/new/<courseId>"
        Then the response status code should be 403
        And the page should contain the text "Zugriff verweigert"

        Examples:
            | courseId |
            | course1  |
            | course3  |

    #########################
    ### Edit
    #########################
    Scenario: As admin I can see the option to edit for exercises in all courses - course1
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/edit             |
            | /exercise/c1-exercise-admin-unpublished/edit |
            | /exercise/c1-exercise-dozent/edit            |

    Scenario: As admin I can see the option to edit for exercises in all courses - course2
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/edit |
            | /exercise/c2-exercise-admin/edit   |

    Scenario: As admin I can see the option to edit for exercises in all courses - course3
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course3"
        Then the page contains all the following texts:
            | /exercise/c3-exercise-admin/edit |

    Scenario Outline: As admin I can access the edit page of all exercises
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I visit url "/exercise/<exerciseId>/edit"
        Then the response status code should be 200
        And the page should contain the text "Aufgabe speichern"

        Examples:
            | exerciseId                    |
            | c1-exercise-admin             |
            | c1-exercise-admin-unpublished |
            | c3-exercise-admin             |
            | c1-exercise-dozent            |
            | c2-exercise-student           |

    Scenario: As dozent I can see the option to edit for exercises only in assigned courses
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/edit             |
            | /exercise/c1-exercise-admin-unpublished/edit |
            | /exercise/c1-exercise-dozent/edit            |

    Scenario Outline: As dozent I can access the edit page of exercises in assigned courses
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I visit url "/exercise/<exerciseId>/edit"
        Then the response status code should be "<statusCode>"
        And the page should contain the text "<text>"

        Examples:
            | exerciseId                    | statusCode | text               |
            | c1-exercise-admin             | 200        | Aufgabe speichern  |
            | c1-exercise-admin-unpublished | 200        | Aufgabe speichern  |
            | c1-exercise-dozent            | 200        | Aufgabe speichern  |
            | c2-exercise-student           | 403        | Zugriff verweigert |
            | c3-exercise-admin             | 403        | Zugriff verweigert |

    Scenario: As student I can not see the option to edit exercises I did not create
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course1"
        Then the page contains none of the following texts:
            | /exercise/c1-exercise-admin/edit             |
            | /exercise/c1-exercise-admin-unpublished/edit |
            | /exercise/c1-exercise-dozent/edit            |

    Scenario: As student I can see the option to edit for exercises I created
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/edit |

    Scenario Outline: As student I can access the edit page of exercises I created
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I visit url "/exercise/<exerciseId>/edit"
        Then the response status code should be "<statusCode>"
        And the page should contain the text "<text>"

        Examples:
            | exerciseId                    | statusCode | text               |
            | c2-exercise-student           | 200        | Aufgabe speichern  |
            | c1-exercise-admin             | 403        | Zugriff verweigert |
            | c1-exercise-admin-unpublished | 403        | Zugriff verweigert |
            | c1-exercise-dozent            | 403        | Zugriff verweigert |
            | c3-exercise-admin             | 403        | Zugriff verweigert |

    #########################
    ### Delete
    #########################
    Scenario: As admin I can see the option to delete for exercises in all courses - course1
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/delete             |
            | /exercise/c1-exercise-admin-unpublished/delete |
            | /exercise/c1-exercise-dozent/delete            |

    Scenario: As admin I can see the option to delete for exercises in all courses - course2
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/delete |

    Scenario: As admin I can see the option to delete for exercises in all courses - course3
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course3"
        Then the page contains all the following texts:
            | /exercise/c3-exercise-admin/delete |

    Scenario Outline: As admin I can access the delete page of all exercises
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I visit url "/exercise/<exerciseId>/delete"
        Then the response status code should be 200
        And the page should contain the text "Aufgabe erfolgreich gelöscht!"

        Examples:
            | exerciseId                    |
            | c1-exercise-admin             |
            | c1-exercise-admin-unpublished |
            | c3-exercise-admin             |
            | c1-exercise-dozent            |
            | c2-exercise-student           |

    Scenario: As dozent I can see the option to delete for exercises only in assigned courses - course1
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/delete             |
            | /exercise/c1-exercise-admin-unpublished/delete |
            | /exercise/c1-exercise-dozent/delete            |

    Scenario Outline: As dozent I can access the delete page of exercises in assigned courses
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I visit url "/exercise/<exerciseId>/delete"
        Then the response status code should be "<statusCode>"
        And the page should contain the text "<text>"

        Examples:
            | exerciseId                    | statusCode | text                          |
            | c1-exercise-admin             | 200        | Aufgabe erfolgreich gelöscht! |
            | c1-exercise-admin-unpublished | 200        | Aufgabe erfolgreich gelöscht! |
            | c1-exercise-dozent            | 200        | Aufgabe erfolgreich gelöscht! |
            | c2-exercise-student           | 403        | Zugriff verweigert            |
            | c3-exercise-admin             | 403        | Zugriff verweigert            |

    Scenario: As student I can see the option to delete for my created exercises - course1
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course1"
        Then the page contains none of the following texts:
            | /exercise/c1-exercise-admin/delete             |
            | /exercise/c1-exercise-admin-unpublished/delete |
            | /exercise/c1-exercise-dozent/delete            |

    Scenario: As student I can see the option to delete for my created exercises - course2
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/delete |

    Scenario Outline: As student I can access the delete page of exercises I created
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I visit url "/exercise/<exerciseId>/delete"
        Then the response status code should be "<statusCode>"
        And the page should contain the text "<text>"

        Examples:
            | exerciseId                    | statusCode | text                          |
            | c2-exercise-student           | 200        | Aufgabe erfolgreich gelöscht! |
            | c1-exercise-admin             | 403        | Zugriff verweigert            |
            | c1-exercise-admin-unpublished | 403        | Zugriff verweigert            |
            | c1-exercise-dozent            | 403        | Zugriff verweigert            |
            | c3-exercise-admin             | 403        | Zugriff verweigert            |

    #########################
    ### Test
    #########################
    Scenario: As admin I can see the option to test exercises in all courses - course1
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/test             |
            | /exercise/c1-exercise-admin-unpublished/test |
            | /exercise/c1-exercise-dozent/test            |

    Scenario: As admin I can see the option to test exercises in all courses - course2
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/test |
            | /exercise/c2-exercise-admin/test   |

    Scenario: As admin I can see the option to test exercises in all courses - course3
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course3"
        Then the page contains all the following texts:
            | /exercise/c3-exercise-admin/test |

    Scenario: As dozent I can see the option to test all exercises in assigned courses he is dozent for - course1
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/test             |
            | /exercise/c1-exercise-admin-unpublished/test |
            | /exercise/c1-exercise-dozent/test            |

    Scenario: As student I can see the option to test my created exercises in assigned courses - course1
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course1"
        Then the page contains none of the following texts:
            | /exercise/c1-exercise-dozent/test            |
            | /exercise/c1-exercise-admin/test             |
            | /exercise/c1-exercise-admin-unpublished/test |

    Scenario: As student I can see the option to test my created exercises in assigned courses - course2
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/test |
        And the page contains none of the following texts:
            | /exercise/c2-exercise-admin/test |

    #########################
    ### View Solutions
    #########################
    Scenario: As admin I can see the option to view solutions of all exercises in all courses - course1
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course1"
        Then the page contains all the following texts:
            | /exercise/c1-exercise-admin/show-solutions             |
            | /exercise/c1-exercise-admin-unpublished/show-solutions |
            | /exercise/c1-exercise-dozent/show-solutions            |

    Scenario: As admin I can see the option to view solutions of all exercises in all courses - course2
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/show-solutions |
            | /exercise/c2-exercise-admin/show-solutions   |

    Scenario: As admin I can see the option to view solutions of all exercises in all courses - course3
        Given I am logged in via browser as "test-admin@sandstorm.de"
        When I click on "course3"
        Then the page contains all the following texts:
            | /exercise/c3-exercise-admin/show-solutions |

    Scenario: As dozent I can see the option to delete for exercises only in assigned courses
        Given I am logged in via browser as "test-dozent@sandstorm.de"
        When I click on "course1"
        And the page contains all the following texts:
            | /exercise/c1-exercise-admin/show-solutions             |
            | /exercise/c1-exercise-admin-unpublished/show-solutions |
            | /exercise/c1-exercise-dozent/show-solutions            |

    Scenario: As student I can see the option to delete for my created exercises - course1
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course1"
        Then the page contains none of the following texts:
            | /exercise/c1-exercise-admin/show-solutions             |
            | /exercise/c1-exercise-admin-unpublished/show-solutions |
            | /exercise/c1-exercise-dozent/show-solutions            |

    Scenario: As student I can see the option to delete for my created exercises - course2
        Given I am logged in via browser as "test-student@sandstorm.de"
        When I click on "course2"
        Then the page contains all the following texts:
            | /exercise/c2-exercise-student/show-solutions |
        Then the page contains none of the following texts:
            | /exercise/c2-exercise-admin/show-solutions |
