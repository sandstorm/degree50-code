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

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [ self::EDIT_MEMBERS, self::EDIT, self::DELETE])) {
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
            case self::EDIT_MEMBERS:
                return $this->canEditMembers($course, $user);
            case self::EDIT || self::DELETE:
                return $this->canEdit($user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canEditMembers(Course $course, User $user)
    {
        return $user->getCourseRoles()->exists(fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course && $courseRole->getUser() === $user && $courseRole->getName() == CourseRole::DOZENT);
    }

    private function canEdit(User $user)
    {
        return $user->isDozent() || $user->isAdmin();
    }
}
