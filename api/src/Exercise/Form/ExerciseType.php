<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\Exercise;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExerciseType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, ['label' =>"exercise.labels.name", 'translation_domain' => 'forms'])
            ->add('description', CKEditorType::class, ['label' =>"exercise.labels.description", 'translation_domain' => 'forms'])
            ->add('save', SubmitType::class, ['label' => 'exercise.labels.submit', 'translation_domain' => 'forms'])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Exercise::class,
        ]);
    }
}
