<?php


namespace App\Security\Voter;


use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExercisePhaseTeamVoter extends Voter
{
    const JOIN = 'join';
    const SHOW = 'show';
    const LEAVE = 'leave';
    const DELETE = 'delete';
    const UPDATE_SOLUTION = 'updateSolution';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::JOIN, self::SHOW, self::LEAVE, self::DELETE, self::UPDATE_SOLUTION])) {
            return false;
        }

        if (!$subject instanceof ExercisePhaseTeam) {
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

        if ($subject instanceof ExercisePhaseTeam) {
            /** @var ExercisePhaseTeam $exercisePhaseTeam */
            $exercisePhaseTeam = $subject;
        } else {
            return false;
        }

        switch ($attribute) {
            case self::SHOW:
                return $this->canShow($exercisePhaseTeam, $user);
            case self::JOIN:
                return $this->canJoin($exercisePhaseTeam, $user);
            case self::LEAVE:
                return $this->canLeave($exercisePhaseTeam, $user);
            case self::DELETE:
                return $this->canDelete($exercisePhaseTeam, $user);
            case self::UPDATE_SOLUTION:
                return $this->canUpdateSolution($exercisePhaseTeam, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canLeave(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        // does the owner can leave its own team, yes or no?
        if ($exercisePhaseTeam->getCreator() === $user) {
            return false;
        }
        return $exercisePhaseTeam->getMembers()->contains($user);
    }

    private function canDelete(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        return $exercisePhaseTeam->getCreator() === $user;
    }

    // TODO: anyone can view a result
    private function canShow(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        if ($exercisePhaseTeam->getExercisePhase()->getBelongsToExercise()->getCreator() === $user) {
            return true;
        }
        return $exercisePhaseTeam->getMembers()->contains($user);
    }

    private function canJoin(ExercisePhaseTeam $exercisePhaseTeam, User $user): bool
    {
        $existingTeams = $exercisePhaseTeam->getExercisePhase()->getTeams();
        $canJoin = true;
        foreach($existingTeams as $team) {
            if($team->getMembers()->contains($user)) {
                $canJoin = false;
            }
        }

        return $canJoin;
    }

    private function canUpdateSolution(ExercisePhaseTeam $exercisePhaseTeam, User $user)
    {
        return $exercisePhaseTeam->getMembers()->contains($user);
    }
}
