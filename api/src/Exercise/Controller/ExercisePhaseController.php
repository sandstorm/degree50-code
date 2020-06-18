<?php

namespace App\Exercise\Controller;

use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Exercise\Material;
use App\Entity\Exercise\Solution;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExercisePhaseType;
use App\Exercise\Form\VideoAnalysisType;
use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExercisePhaseController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private AppRuntime $appRuntime;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, AppRuntime $appRuntime)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->appRuntime = $appRuntime;
    }

    /**
     * @Route("/exercise-phase/show/{id}/{team_id}", name="app_exercise-phase-show")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function show(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        // config for the ui to render the react components
        $config = [
            'title' => $exercisePhase->getName(),
            'description' => $exercisePhase->getTask(),
            'type' => $exercisePhase->getType(),
            'components' => $exercisePhase->getComponents(),
            'material' => array_map(function (Material $entry) {
                return [
                    'id' => $entry->getId(),
                    'name' => $entry->getName(),
                    'url' => $this->generateUrl('app_material-download', ['id' => $entry->getId()])
                ];
            }, $exercisePhase->getMaterial()->toArray()),
            'videos' => array_map(function (Video $video) {
                $videoUrl = $this->appRuntime->virtualizedFileUrl($video->getEncodedVideoDirectory());
                return [
                    'id' => $video->getId(),
                    'name' => $video->getTitle(),
                    'description' => $video->getDescription(),
                    'url' => $videoUrl . '/hls.m3u8'
                ];
            }, $exercisePhase->getVideos()->toArray())
        ];

        return $this->render('ExercisePhase/Show.html.twig', [
            'config' => $config,
            'exercisePhase' => $exercisePhase,
            'exercisePhaseTeam' => $exercisePhaseTeam,
            'solution' => $exercisePhaseTeam->getSolution()
        ]);
    }

    /**
     * @Route("/exercise-phase/share-result/{id}/{team_id}", name="app_exercise-phase-share-result")
     * @Entity("exercisePhaseTeam", expr="repository.find(team_id)")
     */
    public function shareResult(ExercisePhase $exercisePhase, ExercisePhaseTeam $exercisePhaseTeam): Response
    {
        $solution = new Solution();
        $solution->setTeam($exercisePhaseTeam);
        // just temporary
        $solution->setSolution(['solution' => true]);

        $this->eventStore->addEvent('SolutionShared', [
            'exercisePhaseId' => $exercisePhase->getId(),
            'exercisePhaseTeamId' => $exercisePhaseTeam->getId(),
            'solutionId' => $solution->getId()
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($solution);
        $entityManager->flush();

        return $this->redirectToRoute('app_exercise', ['id' => $exercisePhase->getBelongsToExcercise()->getId(), 'phase' => $exercisePhase->getSorting()]);

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
     * @Route("/exercise/edit/{id}/phase/edit/{phase_id}", name="app_exercise-phase-edit")
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
                            'name' => $material->getName(),
                            'link' => $material->getLink()
                        ])->toArray(),
                        'videos' => $exercisePhase->getVideos()->map(fn(Video $video) => [
                            'videoId' => $video->getId()
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
     * @IsGranted("view", subject="exercise")
     * @Route("/exercise/edit/{id}/phase/delete/{phase_id}", name="app_exercise-phase-delete")
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
