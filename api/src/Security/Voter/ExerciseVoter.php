<?php


namespace App\Security\Voter;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\UserExerciseInteraction;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExerciseVoter extends Voter
{
    const VIEW = 'view';
    const SHOW_SOLUTION = 'showSolution';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const IS_OPENED = 'isOpened';
    const IS_FINISHED = 'isFinished';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::VIEW, self::SHOW_SOLUTION, self::EDIT, self::DELETE, self::IS_OPENED, self::IS_FINISHED])) {
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

        if ($subject instanceof Exercise) {
            /** @var Exercise $exercise */
            $exercise = $subject;
        }

        switch ($attribute) {
            case self::IS_FINISHED:
                return $this->exercisesIsFinished($exercise, $user);
            case self::IS_OPENED:
                return $this->exercisesIsOpened($exercise, $user);
            case self::VIEW:
                return $this->canView($exercise, $user);
            case self::EDIT or self::DELETE or self::SHOW_SOLUTION:
                return $this->canEditOrDelete($exercise, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function exercisesIsOpened(Exercise $exercise, User $user)
    {
        return $exercise->getUserExerciseInteractions()->exists(fn($i, UserExerciseInteraction $userExerciseInteraction) => $userExerciseInteraction->isOpened() && $userExerciseInteraction->getUser() === $user);
    }

    private function exercisesIsFinished(Exercise $exercise, User $user)
    {
        return $exercise->getUserExerciseInteractions()->exists(fn($i, UserExerciseInteraction $userExerciseInteraction) => $userExerciseInteraction->isFinished() && $userExerciseInteraction->getUser() === $user);
    }

    private function canView(Exercise $exercise, User $user)
    {
        $course = $exercise->getCourse();
        $exerciseIsNotPublished = $exercise->getStatus() == Exercise::EXERCISE_CREATED;
        if ($exerciseIsNotPublished && $exercise->getCreator() !== $user) {
            return false;
        }
        if (count($exercise->getPhases()) === 0) {
            return false;
        }
        return $user->getCourseRoles()->exists(fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course && $courseRole->getUser() === $user);
    }

    private function canEditOrDelete(Exercise $exercise, User $user)
    {
        return $user === $exercise->getCreator();
    }
}
