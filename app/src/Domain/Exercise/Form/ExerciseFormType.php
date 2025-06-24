<?php

namespace App\Domain\Exercise\Form;

use App\Domain\CourseRole\Model\CourseRole;
use App\Domain\Exercise\Model\Exercise;
use App\Domain\User\Model\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExerciseFormType extends AbstractType
{
    public function __construct(
        private readonly Security $security,
    )
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        /** @var Exercise $exercise */
        $exercise = $options['data'];
        $courseRoles = $exercise->getCourse()->getCourseRoles();
        $currentUser = $this->security->getUser();

        $userChoices = $courseRoles
            ->map(fn(CourseRole $courseRole) => $courseRole->getUser())
            ->filter(fn(User $user) => $user !== $currentUser)
            ->toArray();

        usort($userChoices, fn(User $a, User $b) => strnatcasecmp($a->getUsername(), $b->getUsername()));

        $builder
            ->add('name', TextType::class, ['label' => "exercise.labels.name", 'translation_domain' => 'DegreeBase'])
            // NOTE: there seems to be a bug inside CKEditor where the editor does not respect the 'required' attribute
            // We currently work around this by falling back to Symfonys own validation via Annotations on the Exercise.php entity.
            // Therefore we added an @Assert\NotBlank to the entity field and also made the field setter property optional.
            ->add('description', TextType::class, [
                'label' => "exercise.labels.description",
                'translation_domain' => 'DegreeBase',
                'required' => true,
                'attr' => [
                    'data-controller' => 'ckeditor',
                    'aria-hidden' => "true",
                    'style' => "height: 1px; width: 1px; padding: 0; margin: 0; border: none; background-color: transparent;",
                    'tabIndex' => '-1'
                ],
            ])
            ->add('users', EntityType::class, [
                'class' => User::class,
                'choices' => $userChoices,
                'required' => false,
                'choice_label' => 'userName',
                'multiple' => true,
                'expanded' => true,
                'label' => 'exercise.labels.users',
                'help' => 'exercise.help.users',
                'translation_domain' => 'DegreeBase',
            ])
            ->add('save', SubmitType::class, ['label' => 'exercise.labels.submit', 'translation_domain' => 'DegreeBase']);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Exercise::class,
        ]);
    }
}
