<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhase\ExercisePhaseType;
use App\Exercise\Controller\ExercisePhaseService;
use App\Repository\Exercise\ExercisePhaseRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExercisePhaseFormType extends AbstractType
{
    private ExercisePhaseRepository $exercisePhaseRepository;

    private ExercisePhaseService $exercisePhaseService;

    public function __construct(
        ExercisePhaseRepository $exercisePhaseRepository,
        ExercisePhaseService $exercisePhaseService,
    )
    {
        $this->exercisePhaseRepository = $exercisePhaseRepository;
        $this->exercisePhaseService = $exercisePhaseService;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];

        $phasesFromSameCourse = $this->exercisePhaseRepository
            ->findBy(['belongsToExercise' => $exercisePhase->belongsToExercise]);
        $exercisePhaseChoices = array_filter(
            $phasesFromSameCourse,
            function (ExercisePhase $phaseDependingOn) use ($exercisePhase) {
                return $this->exercisePhaseService
                    ->isValidDependingOnExerciseCombination($phaseDependingOn, $exercisePhase);
            }
        );

        $components = $exercisePhase->getAllowedComponents();
        $componentChoices = [];
        foreach ($components as $component) {
            $componentChoices[$component] = $component;
        }

        $isReflexionPhase = $exercisePhase->getType() === ExercisePhaseType::REFLEXION;

        $builder
            ->add('dependsOnExercisePhase', EntityType::class, [
                'class' => ExercisePhase::class,
                'choices' => $exercisePhaseChoices,
                'choice_label' => function (ExercisePhase $exercisePhase) {
                    $name = $exercisePhase->getName();
                    $type = $this->exercisePhaseService->getPhaseTypeTitle($exercisePhase->getType());
                    return "$name ($type)";
                },
                'placeholder' => 'Keine',
                'multiple' => false,
                'required' => $isReflexionPhase,
                'disabled' => $exercisePhase->getSorting() === 0 || $exercisePhase->getHasSolutions(),
                'label' => "exercisePhase.labels.dependsOnPreviousPhase",
                'translation_domain' => 'forms',
                'help' => $isReflexionPhase
                    ? "exercisePhase.help.dependsOnPreviousPhase.reflexion"
                    : "exercisePhase.help.dependsOnPreviousPhase.regular",
            ])
            // TODO remove and remove the component choices in the Phase Types
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
            ])
            ->add('isGroupPhase', CheckboxType::class, [
                'required' => false,
                'label' => "exercisePhase.labels.isGroupPhase",
                'disabled' => $exercisePhase->getHasSolutions() || $isReflexionPhase,
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "exercisePhase.help.isGroupPhase",
            ])
            ->add('name', TextType::class, ['label' => "exercisePhase.labels.name", 'translation_domain' => 'forms'])
            // NOTE: there seems to be a bug inside CKEditor where the editor does not respect the 'required' attribute
            // We currently work around this by falling back to symfonys own validation via Annotations on the ExercisePhase.php entity.
            // Therefore we added an @Assert\NotBlank to the entity field and also made the field setter property optional.
            ->add('task', TextType::class, [
                'label' => "exercisePhase.labels.task",
                'translation_domain' => 'forms',
                'required' => true,
                'attr' => [
                    'data-controller' => 'ckeditor',
                    'aria-hidden' => "true",
                    'style' => "height: 1px; width: 1px; padding: 0; margin: 0; border: none; background-color: transparent;",
                    'tabIndex' => '-1'
                ],
            ])
            ->add('save', SubmitType::class, ['label' => 'exercisePhase.labels.submit', 'translation_domain' => 'forms']);

        // We can't just simply omit fields inside the twig template, because they will be appended to the form,
        // even if we "turn them off" inside the template.
        // Therefore we add them conditionally here
        if (!$isReflexionPhase) {
            $builder
                ->add('otherSolutionsAreAccessible', CheckboxType::class, [
                    'required' => false,
                    'disabled' => false,
                    'label' => "exercisePhase.labels.otherSolutionsAreAccessible",
                    'translation_domain' => 'forms',
                    'block_prefix' => 'toggleable_button_checkbox',
                    'help' => "exercisePhase.help.otherSolutionsAreAccessible",
                ])
                // ReflexionPhase is always a group phase
                ->add('isGroupPhase', CheckboxType::class, [
                    'required' => false,
                    'label' => "exercisePhase.labels.isGroupPhase",
                    'disabled' => $exercisePhase->getHasSolutions(),
                    'translation_domain' => 'forms',
                    'block_prefix' => 'toggleable_button_checkbox',
                    'help' => "exercisePhase.help.isGroupPhase",
                ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ExercisePhase::class,
        ]);
    }
}
