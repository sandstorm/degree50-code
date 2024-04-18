<?php

namespace App\Security\Voter;

use App\Domain\Account\CourseRole;
use App\Domain\Exercise\Model\Exercise;
use App\Domain\Exercise\Model\ExerciseStatus;
use App\Domain\Exercise\Service\ExerciseService;
use App\Domain\User\Model\User;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExerciseVoter extends Voter
{
    const VIEW = 'view';
    const TEST = 'test';
    const SHOW_SOLUTION = 'showSolution';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const IS_OPENED = 'isOpened';
    const IS_FINISHED = 'isFinished';

    private ExerciseService $exerciseService;

    function __construct(ExerciseService $exerciseService)
    {
        $this->exerciseService = $exerciseService;
    }

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [
            self::VIEW,
            self::TEST,
            self::SHOW_SOLUTION,
            self::EDIT,
            self::DELETE,
            self::IS_OPENED,
            self::IS_FINISHED
        ])) {
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
                    return $this->exerciseHasBeenFinished($exercise, $user);
                case self::IS_OPENED:
                    return $this->exerciseHasBeenStarted($exercise, $user);
                case self::VIEW:
                    return $this->canView($exercise, $user);
                case self::TEST:
                    return $this->canTest($exercise, $user);
                case self::EDIT:
                case self::DELETE:
                case self::SHOW_SOLUTION:
                    return $this->canEditOrDelete($exercise, $user);
            }
        } else {
            return false;
        }

        throw new LogicException('This code should not be reached!');
    }

    private function exerciseHasBeenStarted(Exercise $exercise, User $user): bool
    {
        return $this->exerciseService->getExerciseStatusForUser($exercise, $user) === ExerciseStatus::IN_BEARBEITUNG;
    }

    private function exerciseHasBeenFinished(Exercise $exercise, User $user): bool
    {
        return $this->exerciseService->getExerciseStatusForUser($exercise, $user) === ExerciseStatus::BEENDET;
    }

    public static function canTest(Exercise $exercise, User $user): bool
    {
        // creator can test
        if ($exercise->getCreator() === $user) {
            return true;
        }

        // student can only test his/her own exercises
        if ($user->isStudent()) {
            return false;
        }

        // if user has role "dozent" in course, he or she can test
        $isCourseDozent = ExerciseService::userIsCourseDozent($user, $exercise->getCourse());

        return $isCourseDozent && $user->isDozent();
    }

    private function canView(Exercise $exercise, User $user): bool
    {
        $course = $exercise->getCourse();
        $hasAccessToCourse = $user->getCourseRoles()->exists(
            fn ($i, CourseRole $courseRole) => $courseRole->getCourse() === $course &&
                $courseRole->getUser() === $user
        );

        if ($hasAccessToCourse) {
            // Dozent has access
            if ($user->isDozent()) {
                return true;
            }

            // everyone else needs to wait for publication
            $exercisePublished = $exercise->getStatus() == Exercise::EXERCISE_PUBLISHED;
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

        $isCourseDozent = ExerciseService::userIsCourseDozent($user, $exercise->getCourse());

        // Dozent && KursDozent has access
        if ($isCourseDozent && $user->isDozent()) {
            return true;
        }

        return false;
    }
}
