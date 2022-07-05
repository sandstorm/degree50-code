<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase;
use App\Exercise\Controller\ExercisePhaseService;
use App\Repository\Exercise\ExercisePhaseRepository;
use App\Repository\Video\VideoRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;


class ReflexionPhaseFormType extends ExercisePhaseFormType
{
    private ExercisePhaseRepository $exercisePhaseRepository;
    private ExercisePhaseService $exercisePhaseService;

    public function __construct(ExercisePhaseRepository $exercisePhaseRepository, ExercisePhaseService $exercisePhaseService)
    {
        parent::__construct($exercisePhaseRepository, $exercisePhaseService);
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);

        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];

        $phasesFromSameCourse = $this->exercisePhaseRepository->findBy(['belongsToExercise' => $exercisePhase->belongsToExercise]);
        $exercisePhaseChoices = array_filter($phasesFromSameCourse, function (ExercisePhase $phaseDependingOn) use ($exercisePhase) {
            return $this->exercisePhaseService->isValidDependingOnExerciseCombination($phaseDependingOn, $exercisePhase);
        });

        $builder
            ->add('dependsOnExercisePhase', EntityType::class, [
                'class' => ExercisePhase::class,
                'choices' => $exercisePhaseChoices,
                'choice_label' => 'name',
                'placeholder' => 'Keine',
                'multiple' => false,
                'required' => false,
                'disabled' => $exercisePhase->getSorting() === 0 || $exercisePhase->getHasSolutions(),
                'label' => "exercisePhase.labels.dependsOnPreviousPhase",
                'translation_domain' => 'forms',
                'help' =>  "exercisePhase.help.dependsOnPreviousPhase.reflexion",
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ReflexionPhase::class,
        ]);
    }
}


