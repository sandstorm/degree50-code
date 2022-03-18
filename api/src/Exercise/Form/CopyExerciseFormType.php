<?php

namespace App\Exercise\Form;

use App\Entity\Account\Course;
use App\Entity\Exercise\Exercise;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CopyExerciseFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('course', EntityType::class, [
                'class' => Course::class,
                'choice_label' => 'name',
                'multiple' => false,
                // FIXME: The combo 'required' & 'expanded' renders a '*' before every option :( maybe suppress via css
                'required' => true,
                'expanded' => true,
                'label' => 'Zu kurs hinzufügen', // TODO use translation
                'translation_domain' => 'forms',
            ])
            ->add('copyPhases', CheckboxType::class, [
                'mapped' => false,
                'label' => 'Aufgabe mit Phase kopieren', // TODO use translation
                'required' => false,
                'translation_domain' => 'forms',
            ])
            ->add('save', SubmitType::class, ['label' => 'exercise.copy.title', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Exercise::class,
        ]);
    }
}
