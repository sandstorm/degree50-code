<?php

namespace App\Domain\Course\Form;

use App\Domain\Course\Model\Course;
use App\Domain\CourseRole\Model\CourseRole;
use App\Domain\Fachbereich\Model\Fachbereich;
use App\Domain\User\Model\User;
use App\Domain\User\Repository\UserRepository;
use App\Security\Voter\CourseVoter;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class CourseFormType extends AbstractType
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly Security       $security,
        private readonly CourseVoter    $courseVoter,
    )
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        /** @var Course $course */
        $course = $options['data'];
        $courseRoles = $course->getCourseRoles();
        $userChoices = array_filter($this->userRepository->findBy([], array('email' => 'ASC')), function (User $user) use ($courseRoles) {
            // only dozent
            if (!$user->isDozent()) {
                return false;
            }
            // skip users that are already in the course
            $exists = $courseRoles->exists(fn($i, CourseRole $courseRole) => $courseRole->getUser() === $user);
            return !$exists;
        });

        $builder
            ->add('name', TextType::class, ['label' => "course.labels.name", 'translation_domain' => 'DegreeBase'])
            ->add('fachbereich', EntityType::class, [
                'label' => 'course.labels.fachbereich',
                'translation_domain' => 'DegreeBase',
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
                'translation_domain' => 'DegreeBase',
                'mapped' => false
            ])
            ->add('save', SubmitType::class, ['label' => 'course.labels.submit', 'translation_domain' => 'DegreeBase']);

        $canCreateTutorialCourse = $this->courseVoter->vote($this->security->getToken(), null, [CourseVoter::CREATE_TUTORIAL_COURSE]) === VoterInterface::ACCESS_GRANTED;

        if ($canCreateTutorialCourse) {
            $builder->add('isTutorialCourse', CheckboxType::class, [
                'label' => 'course.labels.isTutorialCourse',
                'translation_domain' => 'DegreeBase',
                'required' => false,
                'help' => 'course.help.isTutorialCourse',
            ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Course::class,
        ]);
    }
}
