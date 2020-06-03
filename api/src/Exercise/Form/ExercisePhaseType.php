<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhase;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExercisePhaseType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('isGroupPhase', CheckboxType::class, [
                'required' => false,
                'label' => "exercisePhase.labels.isGroupPhase",
                'translation_domain' => 'forms'
            ])
            ->add('material', CollectionType::class, [
                'label' => false,
                'entry_type' => MaterialType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false
            ])
            ->add('name', TextType::class, ['label' => "exercisePhase.labels.name", 'translation_domain' => 'forms'])
            ->add('task', TextareaType::class, ['label' => "exercisePhase.labels.task", 'translation_domain' => 'forms'])
            ->add('save', SubmitType::class, ['label' => 'exercisePhase.labels.submit', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ExercisePhase::class,
        ]);
    }
}
