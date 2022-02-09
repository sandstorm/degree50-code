<?php

namespace App\Exercise\Form;

use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Repository\Account\UserRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CourseMembersType extends AbstractType
{
    private UserRepository $userRepository;

    /**
     * CourseType constructor.
     * @param UserRepository $userRepository
     */
    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }


    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var Course $course */
        $course = $options['data'];
        $courseRoles = $course->getCourseRoles();

        $userChoices = array_filter($this->userRepository->findBy([], array('email' => 'ASC')), function (User $user) use ($courseRoles) {
            // skip users that are ROLE_DOZENT
            if ($user->isDozent()) {
                return false;
            }
            $exists = $courseRoles->exists(fn($i, CourseRole $courseRole) => $courseRole->getUser() === $user);
            return !$exists;
        });

        $builder
            ->add('users', EntityType::class, [
                'class' => User::class,
                'choices' => $userChoices,
                'required' => false,
                'choice_label' => 'userName',
                'multiple' => true,
                'expanded' => false,
                'label' => 'course.labels.user',
                'help' => 'course.help.students',
                'translation_domain' => 'forms',
                'mapped' => false
            ])
            ->add('save', SubmitType::class, ['label' => 'course.labels.addMember', 'translation_domain' => 'forms']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Course::class,
        ]);
    }
}
