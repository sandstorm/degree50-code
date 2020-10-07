<?php

namespace App\Security\Voter;


use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CourseVoter extends Voter
{
    const EDIT = 'edit';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [ self::EDIT])) {
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
            case self::EDIT:
                return $this->canEdit($course, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canEdit(Course $course, User $user)
    {
        return $user->getCourseRoles()->exists(fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course && $courseRole->getUser() === $user && $courseRole->getName() == CourseRole::DOZENT);
    }
}
