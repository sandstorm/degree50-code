<?php


namespace App\Security\Voter;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Exercise\Exercise;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Entity\Exercise\Solution;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class SolutionVoter extends Voter
{
    const REVIEW_SOLUTION = 'reviewSolution';

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [self::REVIEW_SOLUTION])) {
            return false;
        }

        if (!$subject instanceof Solution) {
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

        if ($subject instanceof Solution) {
            $solution = $subject;
        } else {
            return false;
        }

        switch ($attribute) {
            case self::REVIEW_SOLUTION:
                return $this->canReviewSolution($solution, $user);
        }

        throw new LogicException('This code should not be reached!');
    }

    private function canReviewSolution(Solution $solution, User $user): bool
    {
        // admins can do anything
        if ($user->isAdmin()) {
            return true;
        }

        // only Dozenten review solutions
        if (!$user->isDozent()) {
            return false;
        }

        // check if Dozent has access to course
        return $user->getCourseRoles()->exists(function($_, CourseRole $courseRole) use ($solution) {
            if ($courseRole->getName() !== CourseRole::DOZENT) {
                return false;
            }
  
            // check if this solution is one of this course's -> phases' -> team's solution
            return $courseRole->getCourse()->getExercises()->exists(function($key, Exercise $exercise) use ($solution) {
                return $exercise->getPhases()->exists(function($key, ExercisePhase $exercisePhase) use ($solution) {
                    return $exercisePhase->getTeams()->exists(function($key, ExercisePhaseTeam $team) use ($solution) {
                        return $team->getSolution()?->getId() === $solution->getId();
                    });
                });
            });
        });
    }
}
