<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoAnalysisType extends ExercisePhaseType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);

        /* @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];

        $components = $exercisePhase->getAllowedComponents();
        $componentChoices = [];
        foreach ($components as $component) {
            $componentChoices[$component] = $component;
        }

        $builder
            ->add('videoAnnotationsActive', CheckboxType::class, [
                'required' => false,
                'label' => "exercisePhase.components.videoAnnotation.label",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
            ])
            ->add('videoCodesActive', CheckboxType::class, [
                'required' => false,
                'label' => "exercisePhase.components.videoCode.label",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
            ])
            ->add('components', ChoiceType::class, [
                'label' => "exercisePhase.labels.components",
                'translation_domain' => 'forms',
                'choices' => $componentChoices,
                'multiple' => true,
                'expanded' => true,
                'choice_label' => function ($choice, $key, $value) {
                    return 'exercisePhase.components.' . $key . '.label';
                },
                'choice_translation_domain' => 'forms'
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => VideoAnalysisPhase::class,
        ]);
    }
}
