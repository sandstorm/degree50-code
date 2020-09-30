<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Video\Video;
use App\Entity\Exercise\VideoCode;
use App\Repository\Exercise\VideoCodeRepository;
use App\Repository\Video\VideoRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoAnalysisType extends ExercisePhaseType
{
    private VideoRepository $videoRepository;
    private VideoCodeRepository $videoCodeRepository;

    /**
     * VideoAnalysisType constructor.
     * @param VideoRepository $videoRepository
     */
    public function __construct(VideoRepository $videoRepository, VideoCodeRepository $videoCodeRepository)
    {
        $this->videoRepository = $videoRepository;
        $this->videoCodeRepository = $videoCodeRepository;
    }


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

        $videoChoices = $this->videoRepository->findByCourse($exercisePhase->getBelongsToExercise()->getCourse());

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
            ->add('videos', EntityType::class, [
                'class' => Video::class,
                'choices' => $videoChoices,
                'required' => true,
                'choice_label' => 'title',
                'multiple' => true,
                'expanded' => true,
                'label' => false,
                'block_prefix' => 'video_entity'
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
