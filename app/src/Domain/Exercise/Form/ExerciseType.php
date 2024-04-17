<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\Exercise;
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
            ->add('name', TextType::class, ['label' => "exercise.labels.name", 'translation_domain' => 'forms'])
            // NOTE: there seems to be a bug inside CKEditor where the editor does not respect the 'required' attribute
            // We currently work around this by falling back to symfonys own validation via Annotations on the Exercise.php entity.
            // Therefore we added an @Assert\NotBlank to the entity field and also made the field setter property optional.
            ->add('description', TextType::class, [
                'label' => "exercise.labels.description",
                'translation_domain' => 'forms',
                'required' => true,
                'attr' => [
                    'data-controller' => 'ckeditor',
                    'aria-hidden' => "true",
                    'style' => "height: 1px; width: 1px; padding: 0; margin: 0; border: none; background-color: transparent;",
                    'tabIndex' => '-1'
                ],
            ])
            ->add('save', SubmitType::class, ['label' => 'exercise.labels.submit', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Exercise::class,
        ]);
    }
}
