<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis;
use App\Entity\Video\Video;
use App\Entity\Video\VideoCode;
use App\Repository\Video\VideoRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoAnalysisType extends ExercisePhaseType
{
    private VideoRepository $videoRepository;

    /**
     * VideoAnalysisType constructor.
     * @param VideoRepository $videoRepository
     */
    public function __construct(VideoRepository $videoRepository)
    {
        $this->videoRepository = $videoRepository;
    }


    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);

        /* @var VideoAnalysis $data */
        $data = $options['data'];
        $components = $data->getAllowedComponents();
        $componentChoices = [];
        foreach($components as $component) {
            $componentChoices[$component] = $component;
        }

        $currentCourse = $data->getBelongsToExcercise()->getCourse();
        // TODO maybe use a VideoDoctrineFilter like the CourseDoctrineFilter.php
        // depending on the user, you only see videos that are assigned to courses you are a member of
        // but thats maybe a good way for the mediathek but not for the creation of exercises...?
        $videoChoices = $this->videoRepository->findByCourse($currentCourse);

        $builder
            ->add('videos', EntityType::class, [
                'class' => Video::class,
                'choices' => $videoChoices,
                'required' => true,
                'choice_label' => 'title',
                'multiple' => true,
                'label' => false
            ])
            ->add('videoCodes', EntityType::class, [
                'class' => VideoCode::class,
                'required' => false,
                'choice_label' => 'name',
                'multiple' => true,
                'label' => false
            ])
            ->add('components', ChoiceType::class, [
                'label' => false,
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
            'data_class' => VideoAnalysis::class,
        ]);
    }
}
