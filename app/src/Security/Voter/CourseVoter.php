<?php

namespace App\Security\Voter;

use App\Domain\Course\Model\Course;
use App\Domain\Exercise\Service\ExerciseService;
use App\Domain\User\Model\User;
use InvalidArgumentException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CourseVoter extends Voter
{
    const string CREATE = 'course_create';
    const string EDIT_MEMBERS = 'course_editMembers';
    const string EDIT = 'course_edit';
    const string DELETE = 'course_delete';
    const string NEW_EXERCISE = 'course_newExercise';
    const string EXPORT_CSV = 'course_exportCSV';
    const string RESET = 'course_reset';
    const string CREATE_TUTORIAL_COURSE = 'course_createTutorialCourse';

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [
            self::CREATE,
            self::EDIT_MEMBERS,
            self::EDIT,
            self::DELETE,
            self::NEW_EXERCISE,
            self::EXPORT_CSV,
            self::RESET,
            self::CREATE_TUTORIAL_COURSE,
        ])) {
            return false;
        }

        // only vote on Course objects except for CREATE
        if (!$subject instanceof Course && !in_array($attribute, [self::CREATE, self::CREATE_TUTORIAL_COURSE])) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            // the user must be logged in; if not, deny access
            return false;
        }

        /** @var Course $course */
        $course = $subject;

        return match ($attribute) {
            self::CREATE => $this->canCreateCourse($user),
            self::NEW_EXERCISE => $this->canCreateNewExercise($user, $course),
            self::EDIT, self::DELETE, self::EDIT_MEMBERS, self::EXPORT_CSV, self::RESET => $this->canEdit($user, $course),
            self::CREATE_TUTORIAL_COURSE => $this->canCreateTutorialCourse($user),
            default => throw new InvalidArgumentException('Unknown attribute ' . $attribute),
        };
    }

    private function canCreateCourse(User $user): bool
    {
        return $user->isAdmin() || $user->isDozent();
    }

    private function canCreateNewExercise(User $user, Course $course): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return ExerciseService::userIsCourseDozent($user, $course);
    }

    private function canEdit(User $user, Course $course): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // User which has ROLE_DOZENT and has the courseRole DOZENT
        return $user->isDozent() && ExerciseService::userIsCourseDozent($user, $course);
    }

    private function canCreateTutorialCourse(User $user): bool
    {
        return $user->isAdmin();
    }
}
