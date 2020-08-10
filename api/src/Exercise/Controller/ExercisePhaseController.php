<?php

namespace App\Exercise\Controller;

use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Exercise\Material;
use App\Entity\Video\Video;
use App\Entity\Video\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExercisePhaseType;
use App\Exercise\Form\VideoAnalysisType;
use App\Exercise\LiveSync\LiveSyncService;
use App\Repository\Exercise\AutosavedSolutionRepository;
use App\Repository\Video\VideoCodeRepository;
use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExercisePhaseController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private AppRuntime $appRuntime;
    private LiveSyncService $liveSyncService;
    private RouterInterface $router;
    private AutosavedSolutionRepository $autosavedSolutionRepository;
    private VideoCodeRepository $videoCodeRepository;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, AppRuntime $appRuntime, LiveSyncService $liveSyncService, RouterInterface $router, AutosavedSolutionRepository $autosavedSolutionRepository, VideoCodeRepository $videoCodeRepository)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
        $this->liveSyncService = $liveSyncService;
        $this->router = $router;
        $this->autosavedSolutionRepository = $autosavedSolutionRepository;
        $this->videoCodeRepository = $videoCodeRepository;
    }

    /**
     * @IsGranted("show", subject="exercisePhaseTeam")
     * @Route("/exercise-phase/show/{id}/{team_id}", name="app_exercise-phase-show")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function show(Request $request, ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        /* @var User $user */
        $user = $this->getUser();

        $showSolution = !!$request->get('showSolution');

        // config for the ui to render the react components
        $config = $this->getConfig($exercisePhase, $showSolution);
        $config['apiEndpoints'] = [
            'updateSolution' => $this->router->generate('app_exercise-phase-team-update-solution', [
                'id' => $exercisePhaseTeam->getId()
            ]),
            'updateCurrentEditor' => $this->router->generate('app_exercise-phase-team-update-current-editor', [
                'id' => $exercisePhaseTeam->getId()
            ]),
        ];

        $response = new Response();
        $response->headers->setCookie($this->liveSyncService->getSubscriberJwtCookie($user));

        $solution = $this->autosavedSolutionRepository->getLatestSolutionOfExerciseTeam($exercisePhaseTeam);

        $currentEditor = null;

        if (!$showSolution) {
            if ($exercisePhaseTeam->getCurrentEditor()) {
                $currentEditor = $exercisePhaseTeam->getCurrentEditor()->getId();
            } else {
                $currentEditor = $user->getId();
                $exercisePhaseTeam->setCurrentEditor($user);
                $entityManager = $this->getDoctrine()->getManager();
                $this->eventStore->disableEventPublishingForNextFlush();
                $entityManager->persist($exercisePhaseTeam);
                $entityManager->flush();
            }
        }

        $template = 'ExercisePhase/Show.html.twig';
        if ($showSolution) {
            $template = 'ExercisePhase/ShowSolution.html.twig';
        }

        return $this->render($template, [
            'config' => $config,
            'liveSyncConfig' => $this->liveSyncService->getClientSideLiveSyncConfig($exercisePhaseTeam),
            'exercisePhase' => $exercisePhase,
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'solution' => $solution,
            'currentEditor' => $currentEditor,
        ], $response);
    }

    private function getConfig($exercisePhase, $readOnly = false)
    {
        /* @var User $user */
        $user = $this->getUser();

        return [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $exercisePhase->getComponents(),
            'userId' => $user->getId(),
            'isGroupPhase' => $exercisePhase->isGroupPhase(),
            'readOnly' => $readOnly,
            'videoCodes' => array_map(function (VideoCode $videoCode) {
                return [
                    'id' => $videoCode->getId(),
                    'name' => $videoCode->getName(),
                    'description' => $videoCode->getDescription(),
                    'color' => $videoCode->getColor(),
                ];
            }, $exercisePhase->getVideoCodes()->toArray()),
            'material' => array_map(function (Material $entry) {
                return [
                    'id' => $entry->getId(),
                    'name' => $entry->getName(),
                    'type' => $entry->getMimeType(),
                    'url' => $this->generateUrl('app_material-download', ['id' => $entry->getId()])
                ];
            }, $exercisePhase->getMaterial()->toArray()),
            'videos' => array_map(function (Video $video) {
                $videoUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());
                return [
                    'id' => $video->getId(),
                    'name' => $video->getTitle(),
                    'description' => $video->getDescription(),
                    'url' => [
                        'hls' => $videoUrl . '/hls.m3u8',
                        'mp4' => $videoUrl . '/x264.mp4',
                    ]
                ];
            }, $exercisePhase->getVideos()->toArray())
        ];
    }

    /**
     * @IsGranted("showSolutions", subject="exercisePhase")
     * @Route("/exercise-phase/show-solutions/{id}", name="app_exercise-phase-show-solutions")
     */
    public function showSolutions(Request $request, ExercisePhase $exercisePhase): Response
    {
        $solutions = array_map(function (ExercisePhaseTeam $team) {
            return [
                'teamCreator' => $team->getCreator()->getUsername(),
                'teamMembers' => array_map(function (User $member) {
                    return $member->getUsername();
                }, $team->getMembers()->toArray()),
                'solution' => $team->getSolution()->getSolution(),
            ];
        }, $exercisePhase->getTeams()->toArray());

        return $this->render('ExercisePhase/ShowSolutions.html.twig', [
            'config' => $this->getConfig($exercisePhase, true),
            'solutions' => $solutions,
            'exercisePhase' => $exercisePhase,
        ]);
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/new", name="app_exercise-phase-new")
     */
    public function new(Request $request, Exercise $exercise): Response
    {
        $types = [];
        foreach (ExercisePhase::PHASE_TYPES as $type) {
            array_push($types, [
                'id' => $type,
                'iconClass' => $this->translator->trans('exercisePhase.types.' . $type . '.iconClass', [], 'forms'),
                'label' => $this->translator->trans('exercisePhase.types.' . $type . '.label', [], 'forms')
            ]);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'types' => $types,
            'exercise' => $exercise
        ]);
    }

    /**
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/type", name="app_exercise-phase-new-set-type")
     */
    public function setType(Request $request, Exercise $exercise): Response
    {
        $type = $request->query->get('type', null);
        $exercisePhase = new ExercisePhase();
        switch ($type) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                $exercisePhase = new VideoAnalysis();
                break;
        }

        $exercisePhase->setBelongsToExcercise($exercise);

        if ($type != null) {
            $exercisePhase->setSorting(count($exercise->getPhases()));

            $this->eventStore->addEvent('ExercisePhaseCreated', [
                'exercisePhaseId' => $exercisePhase->getId(),
                'type' => $type
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhase);
            $entityManager->flush();

            return $this->redirectToRoute('app_exercise-phase-edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }

        return $this->render('ExercisePhase/ChooseType.html.twig', [
            'exercise' => $exercise
        ]);
    }

    /**
     * @IsGranted("edit", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/edit", name="app_exercise-phase-edit")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function edit(Request $request, Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $form = $this->createForm(ExercisePhaseType::class, $exercisePhase);
        switch ($exercisePhase->getType()) {
            case ExercisePhase::TYPE_VIDEO_ANALYSE :
                $form = $this->createForm(VideoAnalysisType::class, $exercisePhase);
                break;
        }

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $exercisePhase = $form->getData();

            switch ($exercisePhase->getType()) {

                case ExercisePhase::TYPE_VIDEO_ANALYSE :
                    /* @var $exercisePhase VideoAnalysis */
                    $this->eventStore->addEvent('VideoAnalyseExercisePhaseEdited', [
                        'exercisePhaseId' => $exercisePhase->getId(),
                        'name' => $exercisePhase->getName(),
                        'task' => $exercisePhase->getTask(),
                        'isGroupPhase' => $exercisePhase->isGroupPhase(),
                        'material' => $exercisePhase->getMaterial()->map(fn(Material $material) => [
                            'materialId' => $material->getId(),
                            'name' => $material->getName()
                        ])->toArray(),
                        'videos' => $exercisePhase->getVideos()->map(fn(Video $video) => [
                            'videoId' => $video->getId()
                        ])->toArray(),
                        'videoCodes' => $exercisePhase->getVideoCodes()->map(fn(VideoCode $videoCode) => [
                            'videoCodeId' => $videoCode->getId()
                        ])->toArray(),
                        'components' => $exercisePhase->getComponents()
                    ]);
            }

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($exercisePhase);
            $entityManager->flush();

            $this->addFlash(
                'success',
                $this->translator->trans('exercisePhase.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('app_exercise-phase-edit', ['id' => $exercise->getId(), 'phase_id' => $exercisePhase->getId()]);
        }

        return $this->render('ExercisePhase/Edit.html.twig', [
            'exercise' => $exercise,
            'exercisePhase' => $exercisePhase,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("delete", subject="exercisePhase")
     * @Route("/exercise/edit/{id}/phase/{phase_id}/delete", name="app_exercise-phase-delete")
     * @Entity("exercisePhase", expr="repository.find(phase_id)")
     */
    public function delete(Exercise $exercise, ExercisePhase $exercisePhase): Response
    {
        $this->eventStore->addEvent('ExercisePhaseDeleted', [
            'exercisePhaseId' => $exercisePhase->getId()
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($exercisePhase);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('exercisePhase.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('app_exercise-edit', ['id' => $exercise->getId()]);

    }
}
