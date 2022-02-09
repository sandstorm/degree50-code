<?php

namespace App\Admin\Form;

use App\Entity\Account\CourseRole;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class InlineCourseRoleType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('user')
            ->add('name', ChoiceType::class, [
                'choices' => [
                    'Student' => CourseRole::STUDENT,
                    'Dozent' => CourseRole::DOZENT,
                ]
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => CourseRole::class,
        ]);
    }
}
