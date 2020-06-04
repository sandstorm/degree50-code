<?php


namespace App\Security\Voter;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExerciseVoter extends Voter
{

    const VIEW = 'view';
    const EDIT = 'edit';
    const DELETE = 'delete';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::VIEW, self::EDIT, self::DELETE])) {
            return false;
        }

        if (!$subject instanceof Exercise) {
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

        /** @var Exercise $exercise */
        $exercise = $subject;

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($exercise, $user);
            case self::EDIT or self::DELETE:
                return $this->canEditOrDelete($exercise, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }


    private function canView(Exercise $exercise, User $user)
    {
        return $user->getCourseRoles()->exists(fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $exercise->getCourse());
    }

    private function canEditOrDelete(Exercise $exercise, User $user)
    {
        return $user === $exercise->getCreator();
    }

    // TODO can delete
}
