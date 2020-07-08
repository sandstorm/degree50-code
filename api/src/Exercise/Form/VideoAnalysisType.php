<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Video\Video;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoAnalysisType extends ExercisePhaseType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $choices = [];

        /* @var VideoAnalysis $data */
        $data = $options['data'];
        $components = $data->getAllowedComponents();
        foreach($components as $component) {
            $choices[$component] = $component;
        }
        $builder
            ->add('videos', EntityType::class, [
                'class' => Video::class,
                'required' => true,
                'choice_label' => 'title',
                'multiple' => true,
                'label' => false
            ])
            ->add('components', ChoiceType::class, [
                'label' => false,
                'choices' => $choices,
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
            'data_class' => VideoAnalysis::class,
        ]);
    }
}
