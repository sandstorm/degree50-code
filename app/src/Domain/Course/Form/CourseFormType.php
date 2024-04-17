<?php

namespace App\Domain\Course\Form;

use App\Domain\Course;
use App\Domain\CourseRole;
use App\Domain\User;
use App\Domain\Fachbereich;
use App\User\Repository\UserRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CourseFormType extends AbstractType
{

    /**
     * CourseType constructor.
     * @param UserRepository $userRepository
     */
    public function __construct(private readonly UserRepository $userRepository)
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var Course $course */
        $course = $options['data'];
        $courseRoles = $course->getCourseRoles();
        $userChoices = array_filter($this->userRepository->findBy([], array('email' => 'ASC')), function (User $user) use ($courseRoles) {
            // skip users that are ROLE_STUDENT or ROLE_ADMIN
            if ($user->isStudent() || $user->isAdmin()) {
                return false;
            }
            $exists = $courseRoles->exists(fn($i, CourseRole $courseRole) => $courseRole->getUser() === $user);
            return !$exists;
        });

        $builder
            ->add('name', TextType::class, ['label' => "course.labels.name", 'translation_domain' => 'forms'])
            ->add('fachbereich', EntityType::class, [
                'label' => 'zu Fachbereich hinzufügen',
                'required' => false,
                'class' => Fachbereich::class,
                'choice_label' => 'name',
                'multiple' => false,
            ])
            ->add('users', EntityType::class, [
                'class' => User::class,
                'choices' => $userChoices,
                'required' => false,
                'choice_label' => 'userName',
                'multiple' => true,
                'expanded' => true,
                'label' => 'course.labels.tutors',
                'help' => 'course.help.tutors',
                'translation_domain' => 'forms',
                'mapped' => false
            ])
            ->add('save', SubmitType::class, ['label' => 'course.labels.submit', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Course::class,
        ]);
    }
}
