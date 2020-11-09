<?php

namespace App\Security\Voter;


use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CourseVoter extends Voter
{
    const EDIT_MEMBERS = 'editMembers';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const NEW_EXERCISE = 'newExercise';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [ self::EDIT_MEMBERS, self::EDIT, self::DELETE, self::NEW_EXERCISE])) {
            return false;
        }

        if (!$subject instanceof Course) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token)
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            // the user must be logged in; if not, deny access
            return false;
        }

        if ($subject instanceof Course) {
            /** @var Course $course */
            $course = $subject;
        }

        switch ($attribute) {
            case self::NEW_EXERCISE:
                return $this->canCreateNewExercise($user, $course);
            case self::EDIT || self::DELETE || self::EDIT_MEMBERS:
                return $this->canEdit($user, $course);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canCreateNewExercise(User $user, Course $course)
    {
        if ($user->isAdmin()) {
            return true;
        }
        return $user->getCourseRoles()->exists(fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course && $courseRole->getUser() === $user && $courseRole->getName() == CourseRole::DOZENT);
    }

    private function canEdit(User $user, Course $course)
    {
        if ($user->isAdmin()) {
            return true;
        }
        // User which has ROLE_DOZENT and has the courseRole DOZENT
        return $user->isDozent() && $user->getCourseRoles()->exists(fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course && $courseRole->getUser() === $user && $courseRole->getName() == CourseRole::DOZENT);
    }
}
