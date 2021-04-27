<?php

namespace App\DataExport\Controller;

use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideAnnotation;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideCut;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCode;
use App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCodePrototype;
use App\Entity\Exercise\Solution;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use App\Repository\Exercise\SolutionRepository;
use Doctrine\Persistence\ManagerRegistry;
use Psr\Log\LoggerInterface;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use App\DataExport\Controller\Dto\CSVDto;
use App\Entity\Account\Course;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;

class DegreeDataToCsvService {
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private LoggerInterface $logger;
    private ManagerRegistry $managerRegistry;

    private const DEFAULT_DELIMITER = '|';
    private const DEFAULT_ENCLOSURE = '"';
    private const DEFAULT_ENCODING_CONTEXT = [
        CsvEncoder::DELIMITER_KEY => self::DEFAULT_DELIMITER,
        CsvEncoder::ENCLOSURE_KEY => self::DEFAULT_ENCLOSURE,
        CsvEncoder::NO_HEADERS_KEY => true,
    ];

    function __construct(
        LoggerInterface $logger,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        SolutionRepository $solutionRepository,
        ManagerRegistry $managerRegistry
    )
    {
        $this->solutionRepository = $solutionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->logger = $logger;
        $this->managerRegistry = $managerRegistry;
    }

    /**
     * @return CSVDto[]
     */
    public function getAllAsVirtualCSVs(Course $course) {
        $serializer = new Serializer([], [new CsvEncoder()]);

        $solutionData = $this->getSolutionData($course);
        $solutionCSV = $serializer->encode($solutionData, 'csv', self::DEFAULT_ENCODING_CONTEXT);

        $courseUserData = $this->getCourseUserData($course);
        $courseUserCSV = $serializer->encode($courseUserData, 'csv', self::DEFAULT_ENCODING_CONTEXT);

        $teamUserData = $this->getTeamUserData($course);
        $teamUserCSV = $serializer->encode($teamUserData, 'csv', self::DEFAULT_ENCODING_CONTEXT);

        $annotationData = $this->getAnnotationData($course);
        $annotationCSV = $serializer->encode($annotationData, 'csv', self::DEFAULT_ENCODING_CONTEXT);

        $videoCodeData = $this->getVideoCodeData($course);
        $videoCodeCSV = $serializer->encode($videoCodeData, 'csv', self::DEFAULT_ENCODING_CONTEXT);

        $cutData = $this->getCutData($course);
        $cutCSV = $serializer->encode($cutData, 'csv', self::DEFAULT_ENCODING_CONTEXT);

        return [
            new CSVDto('solutions.csv', $solutionCSV),
            new CSVDto('courseUsers.csv', $courseUserCSV),
            new CSVDto('teamUsers.csv', $teamUserCSV),
            new CSVDto('annotations.csv', $annotationCSV),
            new CSVDto('videoCodes.csv', $videoCodeCSV),
            new CSVDto('cuts.csv', $cutCSV)
        ];
    }

    public function getVideoCodeData(Course $course) {
        $exercisePhaseTeams = $this->getExercisePhaseTeamsByCourse($course);

        $solutionDataRows = array_reduce($exercisePhaseTeams, function($carry, ExercisePhaseTeam $team) {
            $exercisePhase = $team->getExercisePhase();
            $solution = $team->getSolution();

            if (empty($exercisePhase) || empty($solution)) {
                return $carry;
            }

            $solutionLists = $solution->getSolution();
            $videoCodes = $solutionLists->getVideoCodes();

            // VideoCodePrototypes may contain child prototypes.
            // To be able to lookup a specific prototype we flatten them into a single list
            // of server side prototypes.
            $nestedServerSideVideoCodePrototypes = $solutionLists->getVideoCodePrototypes();
            $flattenedServerSideVideoCodePrototypes = array_reduce($nestedServerSideVideoCodePrototypes, function (array $carry, ServerSideVideoCodePrototype $serverSidePrototype) {
                $childServerSidePrototypes = $serverSidePrototype->getChildServerSidePrototypes();
                return array_merge($carry, $childServerSidePrototypes);
            }, $nestedServerSideVideoCodePrototypes);

            $rows = array_map(function(ServerSideVideoCode $serverSideVideoCode) use($solution, $flattenedServerSideVideoCodePrototypes) {
                /** @var ServerSideVideoCodePrototype $videoCodePrototype **/
                $videoCodePrototype = current(array_filter($flattenedServerSideVideoCodePrototypes, function($prototype) use($serverSideVideoCode) {
                    return $prototype->getId() == $serverSideVideoCode->getIdFromPrototype();
                }));

                $prototypeData = $videoCodePrototype
                    ? [
                        $videoCodePrototype->getName(),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($videoCodePrototype->getDescription()),
                        $videoCodePrototype->getColor(),
                        $videoCodePrototype->getParentId(),
                        $videoCodePrototype->getUserCreated() ? 'yes' : 'no'
                    ]
                    : [];

                return array_merge(
                    [$solution->getId()],
                    [
                        $serverSideVideoCode->getStart(),
                        $serverSideVideoCode->getEnd(),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($serverSideVideoCode->getText()),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($serverSideVideoCode->getMemo()),
                        $serverSideVideoCode->getColor(),
                        $serverSideVideoCode->getIdFromPrototype(),
                    ],
                    $prototypeData,
                );
            }, $videoCodes);

            return array_merge($carry, $rows);
        }, [
            // CSV headers
            [
                // Solution
                "solutionId",

                // VideoCode
                "start",
                "end",
                "text",
                "memo",
                "color",
                'prototypeId',

                // VideoCodePrototype
                'prototypeName',
                'prototypeDescription',
                'prototypeColor',
                'prototypeParentId',
                'isUserCreatedPrototype',
          ],
        ]);

        return $solutionDataRows;
    }

    public function getAnnotationData(Course $course) {
        $exercisePhaseTeams = $this->getExercisePhaseTeamsByCourse($course);

        $solutionDataRows = array_reduce($exercisePhaseTeams, function($carry, ExercisePhaseTeam $team) {
            $exercisePhase = $team->getExercisePhase();
            $solution = $team->getSolution();

            if (empty($exercisePhase) || empty($solution)) {
                return $carry;
            }

            $solutionLists = $solution->getSolution();
            $annotations = $solutionLists->getAnnotations();

            $rows = array_map(function(ServerSideAnnotation $serverSideAnnotation) use($solution) {
                return array_merge(
                    [$solution->getId()],
                    [
                        $serverSideAnnotation->getStart(),
                        $serverSideAnnotation->getEnd(),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($serverSideAnnotation->getText()),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($serverSideAnnotation->getMemo()),
                        $serverSideAnnotation->getColor(),
                    ],
                );
            }, $annotations);

            return array_merge($carry, $rows);
        }, [
            // CSV headers
            [
                "solutionId",
                "start",
                "end",
                "text",
                "memo",
                "color"
          ],
        ]);

        return $solutionDataRows;
    }

    public function getCutData(Course $course) {
        $exercisePhaseTeams = $this->getExercisePhaseTeamsByCourse($course);

        $solutionDataRows = array_reduce($exercisePhaseTeams, function($carry, ExercisePhaseTeam $team) {
            $exercisePhase = $team->getExercisePhase();
            $solution = $team->getSolution();

            if (empty($exercisePhase) || empty($solution)) {
                return $carry;
            }

            $solutionLists = $solution->getSolution();
            $cuts = $solutionLists->getCutList();

            $rows = array_map(function(ServerSideCut $serverSideCut) use($solution) {
                return array_merge(
                    [$solution->getId()],
                    [
                        $serverSideCut->getStart(),
                        $serverSideCut->getEnd(),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($serverSideCut->getText()),
                        DegreeDataToCsvService::removeLineBreaksFromCellContent($serverSideCut->getMemo()),
                        $serverSideCut->getColor(),
                        $serverSideCut->getUrl(),
                        $serverSideCut->getOffset(),
                        $serverSideCut->getPlaybackRate()
                    ]
                );
            }, $cuts);

            return array_merge($carry, $rows);
        }, [
            // CSV headers
            [
                "solutionId",
                "start",
                "end",
                "text",
                "memo",
                "color",
                'url',
                'offset',
                'playbackRate',
          ],
        ]);

        return $solutionDataRows;
    }

    public function getTeamUserData(Course $course) {
        $exercisePhaseTeams = $this->getExercisePhaseTeamsByCourse($course);

        $teamDataRows = array_reduce($exercisePhaseTeams, function($carry, ExercisePhaseTeam $team) {
            $solution = $team->getSolution();
            $solutionId = $solution ? $solution->getId() : "Keine Lösung vorhanden";

            $teamUsers = $team->getMembers()->toArray();

            $rows = array_map(function(User $teamUser) use($solutionId, $team) {
                return [
                    // User
                    $teamUser->getId(),
                    $teamUser->getEmail(),

                    // Team
                    $team->getId(),
                    $team->getCreator()->getId(),
                    $solutionId,
                ];
            }, $teamUsers);

            return array_merge($carry, $rows);
        }, [
            // CSV headers
            [
                // User
                "userId",
                "user",

                // team
                "teamId",
                "creatorId",
                "solutionId"
          ],
        ]);

        return $teamDataRows;
    }

    public function getCourseUserData(Course $course) {
        $exercisePhaseTeams = $this->getExercisePhaseTeamsByCourse($course);

        $courseDataRows = array_reduce($exercisePhaseTeams, function($carry, ExercisePhaseTeam $team) {
            $exercisePhase = $team->getExercisePhase();

            if (empty($exercisePhase)) {
                return $carry;
            }

            $exercise = $exercisePhase->getBelongsToExercise();
            $course = $exercise->getCourse();
            $courseRoles = $course->getCourseRoles()->toArray();

            $rows = array_map(function(CourseRole $courseRole) use($course) {
                return [
                    $course->getId(),
                    $course->getName(),
                    $courseRole->getName(),
                    $courseRole->getUser()->getEmail(),
                ];
            }, $courseRoles);

            return array_merge($carry, $rows);
        }, [
            // CSV headers
            [
                // Course
                "courseId",
                "courseName",
                "role",
                "user",
          ],
        ]);

        return $courseDataRows;
    }

    public function getSolutionData(Course $course) {
        $exercisePhaseTeams = $this->getExercisePhaseTeamsByCourse($course);

        $this->managerRegistry->getManager()->getFilters()->disable('exercise_doctrine_filter');
        $this->managerRegistry->getManager()->getFilters()->disable('course_doctrine_filter');

        $solutionDataRows = array_reduce($exercisePhaseTeams, function($carry, ExercisePhaseTeam $team) {
            $exercisePhase = $team->getExercisePhase();

            if (empty($exercisePhase)) {
                return $carry;
            }

            $exercise = $exercisePhase->getBelongsToExercise();
            $course = $exercise->getCourse();
            $solution = $team->getSolution();

            return array_merge($carry, [[
                // Solution
                $solution ? $solution->getId() : "Keine Lösung vorhanden",

                // Course
                $course->getId(),
                $course->getName(),

                // Exercise
                $exercise->getId(),
                $exercise->getName(),
                DegreeDataToCsvService::removeLineBreaksFromCellContent($exercise->getDescription()),
                $exercise->getCreatedAt()->format("d.m.Y"),
                $this->getExerciseStatus($exercise->getStatus()),

                // ExercisePhase
                $exercisePhase->getId(),
                $exercisePhase->isGroupPhase(),
                $exercisePhase->getName(),
                DegreeDataToCsvService::removeLineBreaksFromCellContent($exercisePhase->getTask()),
                DegreeDataToCsvService::removeLineBreaksFromCellContent($exercisePhase->getDefinition()),
                $exercisePhase->getType(),
                $exercisePhase->getDependsOnPreviousPhase(),

                // Team
                $team->getId(),
                $team->getCreator()->getEmail(),
            ]]);
        }, [
            // CSV headers
            [
                // Solution
                "id",

                // Course
                "courseId",
                "courseName",

                // Exercise
                "exerciseId",
                "exerciseName",
                "exerciseDescription",
                "exerciseCreatedAt",
                "exerciseStatus",

                // ExercisePhase
                "phaseId",
                "isGroupPhase",
                "phaseName",
                "phaseTask",
                "phaseDefinition",
                "phaseType",
                "dependsOnPreviousPhase",

                // Team
                "teamId",
                "teamCreator",
          ],
        ]);

        return $solutionDataRows;
    }

    private function getExercisePhaseTeamsByCourse(Course $course) {
        $exercises = $course->getExercises()->toArray();
        return array_reduce($exercises, function($carry, Exercise $exercise) {
            $phases = $exercise->getPhases()->toArray();
            $teams = array_reduce($phases, function($carry, ExercisePhase $phase) {
                return array_merge($carry, $phase->getTeams()->toArray());
            }, []);

            return array_merge($carry, $teams);
        }, []);
    }

    // WHY:
    // Linebreaks might lead to broken csv rows (e.g. upon importing them into MS excel etc.)
    private static function removeLineBreaksFromCellContent(string $cellContent) {
        return str_replace(["\n", "\r"], " ", $cellContent);
    }

    private function getExerciseStatus(int $statusCode) {
        return [ "created", "published", "finished" ][$statusCode];
    }
}
