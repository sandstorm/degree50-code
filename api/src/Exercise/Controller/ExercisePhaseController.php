<?php

namespace App\Exercise\Controller;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Exercise\Material;
use App\Entity\Video\Video;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\ExercisePhaseType;
use App\Entity\Exercise\Exercise;
use App\Exercise\Form\VideoAnalysisType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 */
class ExercisePhaseController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * @param TranslatorInterface $translator
     */
    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
    }

    /**
     * @Route("/exercise-phase/{id}", name="app_exercise-phase-show")
     */
    public function show(ExercisePhase $exercisePhase): Response
    {
        return $this->render('ExercisePhase/Show.html.twig', [
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
        foreach(ExercisePhase::PHASE_TYPES as $type) {
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
            case ExercisePhase::VIDEO_ANALYSE :
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
            case ExercisePhase::VIDEO_ANALYSE :
                $form = $this->createForm(VideoAnalysisType::class, $exercisePhase);
                break;
        }

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $exercisePhase = $form->getData();

            switch ($exercisePhase->getType()) {
                case ExercisePhase::VIDEO_ANALYSE :
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
                        ]),
                        'videos' => $exercisePhase->getVideos()->map(fn(Video $video) => [
                            'videoId' => $video->getId()
                        ]),
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
