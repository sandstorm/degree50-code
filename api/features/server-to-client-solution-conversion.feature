@fixtures @conversionForAPI
Feature: Solution from Model is converted to normalized APISolution by SolutionService

    # TODO:
    # we should also test the doctrine filter deactivation inside the SolutionService-methods.
    # However I currently don't know how to best test this, because I don't understand why we sometimes need
    # to deactivate the filter, to successfully retrieve certain models, yet.

    Background:
        Given I am logged in as "foo@bar.de"
        And I have a course with ID "c"
        And I have an exercise with ID "ex" belonging to course "c"
        And I have an exercise phase "ex-p1" belonging to exercise "ex"
        And I have a team with ID "team-1" belonging to exercise phase "ex-p1"
        And I have a predefined videoCodePrototype belonging to execise phase "ex-p1" and with properties
            | id        | name  | description | color     |
            | foo_bar   | Foo   | FooBar      | #ffffff   |

    Scenario: Conversion for general purpose (e.g. exercisePhase/show, exercisePhase/update-solution, exercisePhase/update-currentEditor)
        Given I have a solution with ID "solution-1" belonging to team with ID "team-1" with solutionLists as JSON
            """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Annotation 1",
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
        When I convert the persisted serverSideSolution for team "team-1" to the clientSideSolution
        Then I get normalized client side data as JSON
        """
                {
          "solutions": {
            "byId": {
              "solution-1": {
                "solutionLists": {
                  "annotations": ["solution-1_0"],
                  "videoCodes": ["solution-1_0", "solution-1_1"],
                  "cutList": ["solution-1_0"],
                  "videoCodePrototypes": [
                    "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                    "1605544765106_#ff9300",
                    "foo_bar"
                  ]
                },
                "id": "solution-1",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": {
                  "id": "cut-video-1",
                  "name": "TEST: CutVideo",
                  "description": "",
                  "duration": 0,
                  "url": {
                    "hls": "/data/encoded_videos/cut-video-1/hls.m3u8",
                    "mp4": "/data/encoded_videos/cut-video-1/x264.mp4",
                    "vtt": "/data/encoded_videos/cut-video-1/subtitles.vtt"
                  }
                }
              }
            },
            "current": "solution-1",
            "previous": []
          },
          "annotations": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Annotation 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1"
              }
            }
          },
          "videoCodes": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:02:18.453",
                "end": "00:02:45.000",
                "text": "VideoCode 1",
                "memo": "Ein Memo",
                "color": "#ff9300",
                "idFromPrototype": "1605544765106_#ff9300",
                "solutionId": "solution-1"
              },
              "solution-1_1": {
                "id": "solution-1_1",
                "start": "00:00:01.000",
                "end": "00:00:04.000",
                "text": "VideoCode 2",
                "memo": "",
                "color": "#ffffff",
                "idFromPrototype": "foo_bar",
                "solutionId": "solution-1"
              }
            }
          },
          "cuts": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Cut 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1",
                "offset": 0,
                "url": "test",
                "playbackRate": 1
              }
            }
          },
          "videoCodePrototypes": {
            "byId": {
              "a9fabe25-081e-47bd-8905-4bd46ed3cadf": {
                "id": "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                "name": "Verschiedene Arten der Beteiligung und der Motivation",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [
                  {
                    "id": "1605544765106_#ff9300",
                    "name": "Lob; Kompliment",
                    "description": "",
                    "color": "#ff9300",
                    "videoCodes": [],
                    "parentId": null,
                    "userCreated": true
                  }
                ],
                "parentId": null,
                "userCreated": false
              },
              "1605544765106_#ff9300": {
                "id": "1605544765106_#ff9300",
                "name": "Lob; Kompliment",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [],
                "parentId": null,
                "userCreated": true
              },
              "foo_bar": {
                "id": "foo_bar",
                "name": "Foo",
                "description": "FooBar",
                "color": "#ffffff",
                "videoCodes": [],
                "parentId": null,
                "userCreated": false
              }
            }
          }
        }
        """

    Scenario: Handle solution which depends on previous phase
        Given I have a solution with ID "solution-1" belonging to team with ID "team-1" with solutionLists as JSON
            """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Annotation 1",
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
        Given I have an exercise phase "ex-p2" belonging to exercise "ex"
        Given The exercise phase "ex-p1" depends on the previous phase "ex-p2"
        Given I have a team with ID "team-2" belonging to exercise phase "ex-p2"
        Given I am a member of "team-1"
        Given I am a member of "team-2"
        Given I have a solution with ID "previous-solution-1" belonging to team with ID "team-2" with solutionLists as JSON
        """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Previous Annotation 1",
                  "memo": "Popel",
                  "color": null
                }
              ],
              "videoCodes": [],
              "customVideoCodesPool": [],
              "cutList": []
          }
        """
        When I convert the persisted serverSideSolution for team "team-1" to the clientSideSolution
        Then I get normalized client side data as JSON
        """
        {
          "solutions": {
            "byId": {
              "solution-1": {
                "solutionLists": {
                  "annotations": ["solution-1_0"],
                  "videoCodes": ["solution-1_0", "solution-1_1"],
                  "cutList": ["solution-1_0"],
                  "videoCodePrototypes": [
                    "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                    "1605544765106_#ff9300",
                    "foo_bar"
                  ]
                },
                "id": "solution-1",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": null
              },
              "previous-solution-1": {
                "solutionLists": {
                  "annotations": ["previous-solution-1_0"],
                  "videoCodes": [],
                  "cutList": [],
                  "videoCodePrototypes": []
                },
                "id": "previous-solution-1",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": null
              }
            },
            "current": "solution-1",
            "previous": ["previous-solution-1"]
          },
          "annotations": {
            "byId": {
              "previous-solution-1_0": {
                "id": "previous-solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Previous Annotation 1",
                "memo": "Popel",
                "color": null,
                "solutionId": "previous-solution-1"
              },
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Annotation 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1"
              }
            }
          },
          "videoCodes": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:02:18.453",
                "end": "00:02:45.000",
                "text": "VideoCode 1",
                "memo": "Ein Memo",
                "color": "#ff9300",
                "idFromPrototype": "1605544765106_#ff9300",
                "solutionId": "solution-1"
              },
              "solution-1_1": {
                "id": "solution-1_1",
                "start": "00:00:01.000",
                "end": "00:00:04.000",
                "text": "VideoCode 2",
                "memo": "",
                "color": "#ffffff",
                "idFromPrototype": "foo_bar",
                "solutionId": "solution-1"
              }
            }
          },
          "cuts": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Cut 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1",
                "offset": 0,
                "url": "test",
                "playbackRate": 1
              }
            }
          },
          "videoCodePrototypes": {
            "byId": {
              "a9fabe25-081e-47bd-8905-4bd46ed3cadf": {
                "id": "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                "name": "Verschiedene Arten der Beteiligung und der Motivation",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [
                  {
                    "id": "1605544765106_#ff9300",
                    "name": "Lob; Kompliment",
                    "description": "",
                    "color": "#ff9300",
                    "videoCodes": [],
                    "parentId": null,
                    "userCreated": true
                  }
                ],
                "parentId": null,
                "userCreated": false
              },
              "1605544765106_#ff9300": {
                "id": "1605544765106_#ff9300",
                "name": "Lob; Kompliment",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [],
                "parentId": null,
                "userCreated": true
              },
              "foo_bar": {
                "id": "foo_bar",
                "name": "Foo",
                "description": "FooBar",
                "color": "#ffffff",
                "videoCodes": [],
                "parentId": null,
                "userCreated": false
              }
            }
          }
        }
        """

    Scenario: Conversion uses last autosavedSolution
        Given I have an empty solution with ID "solution-1" belonging to team "team-1"
        And I have an auto saved solution with ID "auto-saved-solution-1" belonging to team "team-1" with solutionLists as JSON
            """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Annotation 1",
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
        When I convert the persisted serverSideSolution for team "team-1" to the clientSideSolution
        Then I get normalized client side data as JSON
        """
                {
          "solutions": {
            "byId": {
              "solution-1": {
                "solutionLists": {
                  "annotations": ["solution-1_0"],
                  "videoCodes": ["solution-1_0", "solution-1_1"],
                  "cutList": ["solution-1_0"],
                  "videoCodePrototypes": [
                    "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                    "1605544765106_#ff9300",
                    "foo_bar"
                  ]
                },
                "id": "solution-1",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": null
              }
            },
            "current": "solution-1",
            "previous": []
          },
          "annotations": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Annotation 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1"
              }
            }
          },
          "videoCodes": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:02:18.453",
                "end": "00:02:45.000",
                "text": "VideoCode 1",
                "memo": "Ein Memo",
                "color": "#ff9300",
                "idFromPrototype": "1605544765106_#ff9300",
                "solutionId": "solution-1"
              },
              "solution-1_1": {
                "id": "solution-1_1",
                "start": "00:00:01.000",
                "end": "00:00:04.000",
                "text": "VideoCode 2",
                "memo": "",
                "color": "#ffffff",
                "idFromPrototype": "foo_bar",
                "solutionId": "solution-1"
              }
            }
          },
          "cuts": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Cut 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1",
                "offset": 0,
                "url": "test",
                "playbackRate": 1
              }
            }
          },
          "videoCodePrototypes": {
            "byId": {
              "a9fabe25-081e-47bd-8905-4bd46ed3cadf": {
                "id": "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                "name": "Verschiedene Arten der Beteiligung und der Motivation",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [
                  {
                    "id": "1605544765106_#ff9300",
                    "name": "Lob; Kompliment",
                    "description": "",
                    "color": "#ff9300",
                    "videoCodes": [],
                    "parentId": null,
                    "userCreated": true
                  }
                ],
                "parentId": null,
                "userCreated": false
              },
              "1605544765106_#ff9300": {
                "id": "1605544765106_#ff9300",
                "name": "Lob; Kompliment",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [],
                "parentId": null,
                "userCreated": true
              },
              "foo_bar": {
                "id": "foo_bar",
                "name": "Foo",
                "description": "FooBar",
                "color": "#ffffff",
                "videoCodes": [],
                "parentId": null,
                "userCreated": false
              }
            }
          }
        }
        """

    Scenario: Conversion for multiple teams (e.g. for the solution view exercisePhase/show-solutions)
        Given I have a solution with ID "solution-1" belonging to team with ID "team-1" with solutionLists as JSON
            """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Annotation 1",
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
        Given I have a team with ID "team-2" belonging to exercise phase "ex-p1"
        And I have a solution with ID "solution-2" belonging to team with ID "team-2" with solutionLists as JSON
            """
            {
              "annotations": [
                {
                  "start": "00:01:03.315",
                  "end": "00:01:30.000",
                  "text": "Annotation 1 Of Team 2",
                  "memo": "",
                  "color": null
                }
              ],
              "videoCodes": [],
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
              "cutList": [ ]
            }
            """
        Given I have a team with ID "team-3" belonging to exercise phase "ex-p1"
        And I have a solution with ID "solution-3" belonging to team with ID "team-3" with solutionLists as JSON
            """
            {
              "annotations": [],
              "videoCodes": [
                {
                  "start": "00:02:18.453",
                  "end": "00:02:45.000",
                  "text": "VideoCode 1 Of Team 3",
                  "memo": "Ein Memo",
                  "color": "#ff9300",
                  "idFromPrototype": "1605544765106_#ff9300"
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
              "cutList": []
            }
            """
        When I convert the persisted serverSideSolutions for all teams of exercise phase "ex-p1" to the client side data
        Then I get normalized client side data as JSON
        """
        {
          "solutions": {
            "byId": {
              "solution-1": {
                "solutionLists": {
                  "annotations": ["solution-1_0"],
                  "videoCodes": ["solution-1_0", "solution-1_1"],
                  "cutList": ["solution-1_0"],
                  "videoCodePrototypes": [
                    "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                    "1605544765106_#ff9300"
                  ]
                },
                "id": "solution-1",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": null
              },
              "solution-2": {
                "solutionLists": {
                  "annotations": ["solution-2_0"],
                  "videoCodes": [],
                  "cutList": [],
                  "videoCodePrototypes": [
                    "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                    "1605544765106_#ff9300"
                  ]
                },
                "id": "solution-2",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": null
              },
              "solution-3": {
                "solutionLists": {
                  "annotations": [],
                  "videoCodes": ["solution-3_0"],
                  "cutList": [],
                  "videoCodePrototypes": [
                    "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                    "1605544765106_#ff9300"
                  ]
                },
                "id": "solution-3",
                "userName": "foo@bar.de",
                "userId": "foo@bar.de",
                "cutVideo": null
              }
            },
            "current": null,
            "previous": ["solution-1", "solution-2", "solution-3"]
          },
          "annotations": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Annotation 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1"
              },
              "solution-2_0": {
                "id": "solution-2_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Annotation 1 Of Team 2",
                "memo": "",
                "color": null,
                "solutionId": "solution-2"
              }
            }
          },
          "videoCodes": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:02:18.453",
                "end": "00:02:45.000",
                "text": "VideoCode 1",
                "memo": "Ein Memo",
                "color": "#ff9300",
                "idFromPrototype": "1605544765106_#ff9300",
                "solutionId": "solution-1"
              },
              "solution-1_1": {
                "id": "solution-1_1",
                "start": "00:00:01.000",
                "end": "00:00:04.000",
                "text": "VideoCode 2",
                "memo": "",
                "color": "#ffffff",
                "idFromPrototype": "foo_bar",
                "solutionId": "solution-1"
              },
              "solution-3_0": {
                "id": "solution-3_0",
                "start": "00:02:18.453",
                "end": "00:02:45.000",
                "text": "VideoCode 1 Of Team 3",
                "memo": "Ein Memo",
                "color": "#ff9300",
                "idFromPrototype": "1605544765106_#ff9300",
                "solutionId": "solution-3"
              }
            }
          },
          "cuts": {
            "byId": {
              "solution-1_0": {
                "id": "solution-1_0",
                "start": "00:01:03.315",
                "end": "00:01:30.000",
                "text": "Cut 1",
                "memo": "",
                "color": null,
                "solutionId": "solution-1",
                "offset": 0,
                "url": "test",
                "playbackRate": 1
              }
            }
          },
          "videoCodePrototypes": {
            "byId": {
              "a9fabe25-081e-47bd-8905-4bd46ed3cadf": {
                "id": "a9fabe25-081e-47bd-8905-4bd46ed3cadf",
                "name": "Verschiedene Arten der Beteiligung und der Motivation",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [
                  {
                    "id": "1605544765106_#ff9300",
                    "name": "Lob; Kompliment",
                    "description": "",
                    "color": "#ff9300",
                    "videoCodes": [],
                    "parentId": null,
                    "userCreated": true
                  }
                ],
                "parentId": null,
                "userCreated": false
              },
              "1605544765106_#ff9300": {
                "id": "1605544765106_#ff9300",
                "name": "Lob; Kompliment",
                "description": "",
                "color": "#ff9300",
                "videoCodes": [],
                "parentId": null,
                "userCreated": true
              },
              "foo_bar": {
                "id": "foo_bar",
                "name": "Foo",
                "description": "FooBar",
                "color": "#ffffff",
                "videoCodes": [],
                "parentId": null,
                "userCreated": false
              }
            }
          }
        }
        """
