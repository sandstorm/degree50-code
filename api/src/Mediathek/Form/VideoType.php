<?php

namespace App\Mediathek\Form;

use App\Entity\Account\Course;
use App\Entity\Video\Video;
use App\Repository\Account\CourseRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VideoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, ['label' => "video.labels.title", 'translation_domain' => 'forms'])
            ->add('description', TextareaType::class, ['label' => "video.labels.description", 'translation_domain' => 'forms'])
            ->add('courses', EntityType::class, [
                'class' => Course::class,
                'required' => true,
                'choice_label' => 'name',
                'multiple' => true,
                'expanded' => false,
                'label' => 'video.labels.courses',
                'translation_domain' => 'forms',
                'group_by' => function (Course $choice, $key, $value) {
                    return $choice->getCreationDateYear();
                },
                'query_builder' => function (CourseRepository $courseRepository) {
                    return $courseRepository->createQueryBuilder('c')
                        ->orderBy('c.name', 'ASC');
                },
            ])
            ->add('save', SubmitType::class, ['label' => "video.labels.submit", 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Video::class,
        ]);
    }
}
