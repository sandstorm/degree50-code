<?php

namespace App\Security\Voter;

use App\Domain\ExercisePhaseTeam\Model\ExercisePhaseTeam;
use App\Domain\User\Model\User;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExercisePhaseTeamVoter extends Voter
{
    const string JOIN = 'join';
    const string SHOW = 'show';
    const string SHOW_SOLUTION = 'showSolution';
    const string LEAVE = 'leave';
    const string DELETE = 'delete';
    const string UPDATE_SOLUTION = 'updateSolution';

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [self::JOIN, self::SHOW, self::SHOW_SOLUTION, self::LEAVE, self::DELETE, self::UPDATE_SOLUTION])) {
            return false;
        }

        if (!$subject instanceof ExercisePhaseTeam) {
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

        if ($subject instanceof ExercisePhaseTeam) {
            $exercisePhaseTeam = $subject;
        } else {
            return false;
        }

        // TODO: use match expression
        switch ($attribute) {
            case self::SHOW:
                return $this->canShow($exercisePhaseTeam, $user);
            case self::SHOW_SOLUTION:
                return $this->canShowSolution($exercisePhaseTeam);
            case self::JOIN:
                return $this->canJoin($exercisePhaseTeam, $user);
            case self::LEAVE:
                return $this->canLeave($exercisePhaseTeam, $user);
            case self::DELETE:
                return $this->canDelete($exercisePhaseTeam, $user);
            case self::UPDATE_SOLUTION:
                return $this->canUpdateSolution($exercisePhaseTeam, $user);
        }

        throw new LogicException('This code should not be reached!');
    }

    private function canLeave(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        $isMember = $exercisePhaseTeam->getMembers()->contains($user);
        // WHY: The last member can't leave - only delete the Team
        $isNotTheOnlyMember = $exercisePhaseTeam->getMembers()->count() > 1;

        return $isMember && $isNotTheOnlyMember;
    }

    private function canDelete(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        $isMember = $exercisePhaseTeam->getMembers()->contains($user);
        // WHY: Only the last member can delete the Team
        $isTheOnlyMember = $exercisePhaseTeam->getMembers()->count() === 1;

        return $isMember && $isTheOnlyMember;
    }

    private function canShow(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        return $exercisePhaseTeam->getMembers()->contains($user);
    }

    private function canShowSolution(ExercisePhaseTeam $exercisePhaseTeam): bool
    {
        return $exercisePhaseTeam->getExercisePhase()->getOtherSolutionsAreAccessible();
    }

    private function canJoin(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        // WHY: Admins & Dozenten can only create their own Team
        // (see issue #261)
        if ($user->isAdmin() || $user->isDozent()) {
            return false;
        }

        $existingTeams = $exercisePhaseTeam->getExercisePhase()->getTeams();
        $canJoin = true;
        foreach ($existingTeams as $team) {
            if ($team->getMembers()->contains($user)) {
                $canJoin = false;
            }
        }

        return $canJoin;
    }

    private function canUpdateSolution(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        return $exercisePhaseTeam->getMembers()->contains($user);
    }
}
