<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase;
use App\Entity\Video\Video;
use App\Exercise\Controller\ExercisePhaseService;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Video\VideoRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoAnalysisPhaseFormFormType extends ExercisePhaseFormType
{
    private VideoRepository $videoRepository;

    public function __construct(ExercisePhaseRepository $exercisePhaseRepository, ExercisePhaseService $exercisePhaseService, VideoRepository $videoRepository)
    {
        parent::__construct($exercisePhaseRepository, $exercisePhaseService);
        $this->videoRepository = $videoRepository;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];

        $videoChoices = $this->videoRepository->findByCourse($exercisePhase->getBelongsToExercise()->getCourse());

        $builder
            ->add('videoAnnotationsActive', CheckboxType::class, [
                'required' => false,
                'disabled' => $exercisePhase->getHasSolutions(),
                'label' => "exercisePhase.components.videoAnnotation.label",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
            ])
            ->add('videoCodesActive', CheckboxType::class, [
                'required' => false,
                'disabled' => $exercisePhase->getHasSolutions(),
                'label' => "exercisePhase.components.videoCode.label",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
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
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => VideoAnalysisPhase::class,
        ]);
    }
}
