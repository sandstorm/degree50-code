<?php

namespace App\Security\Voter;


use App\Domain\Account\Course;
use App\Domain\Account\User;
use App\Exercise\Controller\ExerciseService;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CourseVoter extends Voter
{
    const EDIT_MEMBERS = 'editMembers';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const NEW_EXERCISE = 'newExercise';
    const EXPORT_CSV = 'exportCSV';

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [self::EDIT_MEMBERS, self::EDIT, self::DELETE, self::NEW_EXERCISE, self::EXPORT_CSV])) {
            return false;
        }

        if (!$subject instanceof Course) {
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

        if ($subject instanceof Course) {
            $course = $subject;
        } else {
            return false;
        }

        switch ($attribute) {
            case self::NEW_EXERCISE:
                return $this->canCreateNewExercise($user, $course);
            case self::EDIT || self::DELETE || self::EDIT_MEMBERS || self::EXPORT_CSV:
                return $this->canEdit($user, $course);
        }

        throw new LogicException('This code should not be reached!');
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
}
