<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExercisePhaseType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /* @var ExercisePhase $exercisePhase */
        $exercisePhase = $options['data'];
        $dependsOnPreviousPhaseIsDisabled = $exercisePhase->getSorting() === 0;

        $builder
            ->add('isGroupPhase', CheckboxType::class, [
                'required' => false,
                'label' => "exercisePhase.labels.isGroupPhase",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "exercisePhase.help.isGroupPhase",
            ])
            ->add('dependsOnPreviousPhase', CheckboxType::class, [
                'required' => false,
                'disabled' => $dependsOnPreviousPhaseIsDisabled,
                'label' => "exercisePhase.labels.dependsOnPreviousPhase",
                'translation_domain' => 'forms',
                'block_prefix' => 'toggleable_button_checkbox',
                'help' => "exercisePhase.help.dependsOnPreviousPhase",
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
