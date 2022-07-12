<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhaseTypes\MaterialPhase;
use App\Exercise\Controller\ExercisePhaseService;
use App\Repository\Exercise\ExercisePhaseRepository;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MaterialPhaseFormType extends ExercisePhaseFormType
{
    public function __construct(ExercisePhaseRepository $exercisePhaseRepository, ExercisePhaseService $exercisePhaseService)
    {
        parent::__construct($exercisePhaseRepository, $exercisePhaseService);
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);


        $builder
            ->add('material', TextType::class, [
                'label' => "exercisePhase.labels.material",
                'translation_domain' => 'forms',
                'required' => true,
                'attr' => [
                    'data-controller' => 'ckeditor',
                    'aria-hidden' => "true",
                    'style' => "height: 1px; width: 1px; padding: 0; margin: 0; border: none; background-color: transparent;",
                    'tabIndex' => '-1'
                ],
            ])
            ->add('reviewRequired', CheckboxType::class, [
                'required' => false,
                'label' => "Muss von Dozent:in überprüft werden",
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "Wenn aktiv, dann muss die Materialphase erst von einer dozierenden Person überprüft werden, bevor die Phase beendet werden kann und das Material auf dem Schreibtisch der Studierenden erscheint.",
            ])
            ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MaterialPhase::class,
        ]);
    }
}

