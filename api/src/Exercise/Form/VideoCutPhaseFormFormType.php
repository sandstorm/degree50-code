<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase;
use App\Entity\Video\Video;
use App\Exercise\Controller\ExercisePhaseService;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Video\VideoRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;


class VideoCutPhaseFormFormType extends ExercisePhaseFormType
{
    private VideoRepository $videoRepository;
    private ExercisePhaseRepository $exercisePhaseRepository;
    private ExercisePhaseService $exercisePhaseService;

    public function __construct(ExercisePhaseRepository $exercisePhaseRepository, ExercisePhaseService $exercisePhaseService, VideoRepository $videoRepository)
    {
        parent::__construct($exercisePhaseRepository, $exercisePhaseService);
        $this->videoRepository = $videoRepository;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];

        $videoChoices = $this->videoRepository->findByCourse($exercisePhase->getBelongsToExercise()->getCourse());

        $dependsOnPreviousPhaseIsDisabled = $exercisePhase->getSorting() === 0;

        $phasesFromSameCourse = $this->exercisePhaseRepository->findBy(
            ['belongsToExercise' => $exercisePhase->belongsToExercise]
        );
        $exercisePhaseChoices = array_filter($phasesFromSameCourse, function (ExercisePhase $phaseDependingOn) use ($exercisePhase) {
            return $this->exercisePhaseService->isValidDependingOnExerciseCombination($phaseDependingOn, $exercisePhase);
        });

        $builder
            ->add('videos', EntityType::class, [
                'class' => Video::class,
                'choices' => $videoChoices,
                'required' => true,
                'disabled' => $exercisePhase->getHasSolutions(),
                'choice_label' => 'title',
                'multiple' => true,
                'expanded' => true,
                'label' => false,
                'block_prefix' => 'video_entity'
            ])
            ->add('dependsOnExercisePhase', EntityType::class, [
                'class' => ExercisePhase::class,
                'choices' => $exercisePhaseChoices,
                'choice_label' => 'name',
                'placeholder' => 'Keine',
                'multiple' => false,
                'required' => false,
                'disabled' => $dependsOnPreviousPhaseIsDisabled || $exercisePhase->getHasSolutions(),
                'label' => "exercisePhase.labels.dependsOnPreviousPhase",
                'translation_domain' => 'forms',
                'help' => "exercisePhase.help.dependsOnPreviousPhase.regular",
            ])
            ->add('otherSolutionsAreAccessible', CheckboxType::class, [
                'required' => false,
                'disabled' => false,
                'label' => "exercisePhase.labels.otherSolutionsAreAccessible",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "exercisePhase.help.otherSolutionsAreAccessible",
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => VideoCutPhase::class,
        ]);
    }
}
