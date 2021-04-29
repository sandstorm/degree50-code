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
use App\Repository\Exercise\ExercisePhaseRepository;

class DegreeDataToCsvService {
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private LoggerInterface $logger;
    private ManagerRegistry $managerRegistry;

    private const DEFAULT_DELIMITER = ';';
    private const DEFAULT_ENCLOSURE = '"';
    private const DEFAULT_ENCODING_CONTEXT = [
        CsvEncoder::DELIMITER_KEY => self::DEFAULT_DELIMITER,
        CsvEncoder::ENCLOSURE_KEY => self::DEFAULT_ENCLOSURE,
        CsvEncoder::NO_HEADERS_KEY => true,
    ];

    function __construct(
        LoggerInterface $logger,
        ExercisePhaseTeamRepository $exercisePhaseTeamRepository,
        ExercisePhaseRepository $exercisePhaseRepository,
        SolutionRepository $solutionRepository,
        ManagerRegistry $managerRegistry
    )
    {
        $this->solutionRepository = $solutionRepository;
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
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
            new CSVDto('loesungen.csv', $solutionCSV),
            new CSVDto('kurs-mitglieder.csv', $courseUserCSV),
            new CSVDto('team-mitglieder.csv', $teamUserCSV),
            new CSVDto('annotationen.csv', $annotationCSV),
            new CSVDto('video-kodierungen.csv', $videoCodeCSV),
            new CSVDto('schnitte.csv', $cutCSV)
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
                        $videoCodePrototype->getColor(),
                        $videoCodePrototype->getParentId(),
                        $videoCodePrototype->getUserCreated() ? 'ja' : 'nein'
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
                "loesungsID",

                // VideoCode
                "start",
                "end",
                "text",
                "memo",
                "farbe",
                "codeID",

                // VideoCodePrototype
                "codeName",
                "codeFarbe",
                "elternCodeID",
                "selbstErstellterCode",
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
                "loesungsID",
                "start",
                "end",
                "text",
                "memo",
                "farbe"
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
                    ]
                );
            }, $cuts);

            return array_merge($carry, $rows);
        }, [
            // CSV headers
            [
                "loesungsID",
                "start",
                "end",
                "text",
                "memo",
                "farbe",
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
                "nutzerID",
                "nutzerName",

                // team
                "teamID",
                "teamErstellerID",
                "loesungsID"
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
                "kursID",
                "kursName",
                "kursRolle",
                "nutzerName",
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
            $previousPhase = $exercisePhase->getDependsOnPreviousPhase()
               ? $this->exercisePhaseRepository->findOneBy([
                    'sorting' => $exercisePhase->getSorting() - 1,
                    'belongsToExercise' => $exercisePhase->getBelongsToExercise()
               ])
               : null;

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
                $exercisePhase->isGroupPhase() ? 'Ja' : 'Nein',
                $exercisePhase->getName(),
                DegreeDataToCsvService::removeLineBreaksFromCellContent($exercisePhase->getTask()),
                $exercisePhase->getType(),
                $exercisePhase->getDependsOnPreviousPhase() ? 'Ja' : 'Nein',
                $previousPhase ? $previousPhase->getId() : '-',

                // Team
                $team->getId(),
                $team->getCreator()->getEmail(),
            ]]);
        }, [
            // CSV headers
            [
                // Solution
                "loesungsID",

                // Course
                "kursID",
                "kursName",

                // Exercise
                "aufgabenID",
                "aufgabenTitel",
                "aufgabenBeschreibung",
                "erstellungsDatum",
                "status",

                // ExercisePhase
                "phasenID",
                "istGruppenphase",
                "phasenTitel",
                "phasenBeschreibung",
                "phasenTyp",
                "bautAufVorherigerPhaseAuf",
                "vorherigePhasenID",

                // Team
                "teamID",
                "teamErsteller",
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
