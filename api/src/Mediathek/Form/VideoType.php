<?php

namespace App\Mediathek\Form;

use App\Entity\Account\Course;
use App\Entity\Video\Video;
use App\Repository\Account\CourseRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
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
            ->add('description', TextareaType::class, ['label' => "video.labels.description", 'translation_domain' => 'forms', 'required' => false])
            // TODO own type with link to data-privacy
            ->add('dataPrivacyAccepted', CheckboxType::class, ['label' => "video.labels.dataPrivacyAccepted", 'translation_domain' => 'forms', 'required' => true])
            ->add('courses', EntityType::class, [
                'class' => Course::class,
                'required' => false,
                'choice_label' => 'name',
                'multiple' => true,
                'expanded' => false,
                'label' => 'video.labels.courses',
                'translation_domain' => 'forms',
                'group_by' => function (Course $choice, $key, $value) {
                    return $choice->getCreationDateYear();
                },
                'help' => 'Das Video kann nur von den jeweiligen Kursmitgliedern angeschaut werden. Ohne ausgewählte Kurse ist das Video privat.',
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
