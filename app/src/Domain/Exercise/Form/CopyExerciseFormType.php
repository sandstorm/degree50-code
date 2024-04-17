<?php

namespace App\Domain\Exercise\Form;

use App\Domain\Course;
use App\Domain\Course\Repository\CourseRepository;
use App\Domain\Exercise\Dto\CopyExerciseFormDto;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CopyExerciseFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('course', EntityType::class, [
                'class' => Course::class,
                'query_builder' => function (CourseRepository $courseRepository) {
                    return $courseRepository->createQueryBuilder('c')
                        ->orderBy('c.name', 'ASC');
                },
                'choice_label' => 'name',
                'multiple' => false,
                // FIXME: The combo 'required' & 'expanded' renders a '*' before every option :( maybe suppress via css
                'required' => true,
                'expanded' => true,
                'label' => 'Zu Kurs hinzufügen',
                'translation_domain' => 'forms',
            ])
            ->add('copyPhases', CheckboxType::class, [
                'label' => 'Aufgabe mit Phasen kopieren',
                'required' => false,
                'translation_domain' => 'forms',
            ])
            ->add('save', SubmitType::class, ['label' => 'exercise.copy.title', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => CopyExerciseFormDto::class,
        ]);
    }
}
