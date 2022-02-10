<?php


namespace App\Security\Voter;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\UserExerciseInteraction;
use LogicException;
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

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::SHOW_SOLUTION, self::EDIT, self::DELETE, self::IS_OPENED, self::IS_FINISHED])) {
            return false;
        }

        if (!$subject instanceof Exercise) {
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

        // admin has access to everything
        if ($user->isAdmin()) {
            return true;
        }

        if ($subject instanceof Exercise) {
            $exercise = $subject;


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
        } else {
            return false;
        }

        throw new LogicException('This code should not be reached!');
    }

    private function exercisesIsOpened(Exercise $exercise, User $user): bool
    {
        return $exercise->getUserExerciseInteractions()->exists(fn($i, UserExerciseInteraction $userExerciseInteraction) => $userExerciseInteraction->isOpened() && $userExerciseInteraction->getUser() === $user);
    }

    private function exercisesIsFinished(Exercise $exercise, User $user): bool
    {
        return $exercise->getUserExerciseInteractions()->exists(fn($i, UserExerciseInteraction $userExerciseInteraction) => $userExerciseInteraction->isFinished() && $userExerciseInteraction->getUser() === $user);
    }

    private function canView(Exercise $exercise, User $user): bool
    {
        // creator has access
        if ($exercise->getCreator() === $user) {
            return true;
        }

        $course = $exercise->getCourse();
        $hasAccessToCourse = $user->getCourseRoles()->exists(
            fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course &&
                $courseRole->getUser() === $user
        );

        if ($hasAccessToCourse) {
            // Dozent has access
            if ($user->isDozent()) {
                return true;
            }

            // everyone else needs to wait for publication
            $exercisePublished =
                $exercise->getStatus() == Exercise::EXERCISE_PUBLISHED ||
                $exercise->getStatus() == Exercise::EXERCISE_FINISHED;
            $exerciseNotEmpty = count($exercise->getPhases()) > 0;

            if ($exercisePublished && $exerciseNotEmpty) {
                return true;
            }
        }

        return false;
    }

    private function canEditOrDelete(Exercise $exercise, User $user): bool
    {
        // creator has access
        if ($user === $exercise->getCreator()) {
            return true;
        }

        $course = $exercise->getCourse();
        $isCourseDozent = $user->getCourseRoles()->exists(
            fn($i, CourseRole $courseRole) => $courseRole->getCourse() === $course &&
                $courseRole->getUser() === $user &&
                $courseRole->getName() === CourseRole::DOZENT
        );

        // Dozent && KursDozent has access
        if ($isCourseDozent && $user->isDozent()) {
            return true;
        }

        return false;
    }
}
