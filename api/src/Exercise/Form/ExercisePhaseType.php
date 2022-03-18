<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Video\Video;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Video\VideoRepository;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExercisePhaseType extends AbstractType
{
    private VideoRepository $videoRepository;

    private ExercisePhaseRepository $exercisePhaseRepository;

    public function __construct(VideoRepository $videoRepository, ExercisePhaseRepository $exercisePhaseRepository)
    {
        $this->videoRepository = $videoRepository;
        $this->exercisePhaseRepository = $exercisePhaseRepository;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];
        $dependsOnPreviousPhaseIsDisabled = $exercisePhase->getSorting() === 0 || $exercisePhase->getType() == ExercisePhase\ExercisePhaseType::VIDEO_ANALYSIS;
        $videoChoices = $this->videoRepository->findByCourse($exercisePhase->getBelongsToExercise()->getCourse());
        $exercisePhaseCoices = $this->exercisePhaseRepository->findBy(['belongsToExercise' => $exercisePhase->belongsToExercise]);

        $builder
            ->add('isGroupPhase', CheckboxType::class, [
                'required' => false,
                'label' => "exercisePhase.labels.isGroupPhase",
                'disabled' => $exercisePhase->getHasSolutions(),
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "exercisePhase.help.isGroupPhase",
            ])
            ->add('dependsOnExercisePhase', EntityType::class, [
                'class' => ExercisePhase::class,
                'choices' => $exercisePhaseCoices,
                'choice_label' => 'name',
                'placeholder' => 'Keine',
                'multiple' => false,
                'required' => false,
                'disabled' => $dependsOnPreviousPhaseIsDisabled || $exercisePhase->getHasSolutions(),
                'label' => "exercisePhase.labels.dependsOnPreviousPhase",
                'translation_domain' => 'forms',
                'help' => "exercisePhase.help.dependsOnPreviousPhase",
            ])
            ->add('otherSolutionsAreAccessible', CheckboxType::class, [
                'required' => false,
                'disabled' => false,
                'label' => "exercisePhase.labels.otherSolutionsAreAccessible",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "exercisePhase.help.otherSolutionsAreAccessible",
            ])
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
            ->add('name', TextType::class, ['label' => "exercisePhase.labels.name", 'translation_domain' => 'forms'])
            ->add('task', CKEditorType::class, ['label' => "exercisePhase.labels.task", 'translation_domain' => 'forms'])
            ->add('save', SubmitType::class, ['label' => 'exercisePhase.labels.submit', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ExercisePhase::class,
        ]);
    }
}
