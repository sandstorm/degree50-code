<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Video\Video;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoAnalysisType extends ExercisePhaseType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('videos', EntityType::class, [
                'class' => Video::class,
                'choice_label' => 'title',
                'multiple' => true,
                'label' => "exercisePhase.labels.videos", 'translation_domain' => 'forms'
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => VideoAnalysis::class,
        ]);
    }
}
