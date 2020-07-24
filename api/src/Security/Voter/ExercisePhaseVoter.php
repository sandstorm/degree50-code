<?php


namespace App\Security\Voter;


use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExercisePhaseVoter extends Voter
{
    const SHOW = 'show';
    const NEXT = 'next';
    const DELETE = 'delete';
    const SHOW_SOLUTIONS = 'showSolutions';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::SHOW, self::NEXT, self::DELETE, self::SHOW_SOLUTIONS])) {
            return false;
        }

        if (!$subject instanceof ExercisePhase) {
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

        if ($subject instanceof ExercisePhase) {
            /** @var ExercisePhase $exercisePhase */
            $exercisePhase = $subject;
        } else {
            return false;
        }

        switch ($attribute) {
            case self::SHOW:
                return $this->canShow($exercisePhase, $user);
            case self::NEXT:
                return $this->canGetToNextPhase($exercisePhase, $user);
            case self::DELETE:
                return $this->canDelete($exercisePhase, $user);
            case self::SHOW_SOLUTIONS:
                return $this->canShowSolutions($exercisePhase, $user);

        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canShow(ExercisePhase $exercisePhase, User $user)
    {
        return $exercisePhase->getTeams()->exists(fn($i, ExercisePhaseTeam $exercisePhaseTeam) => $exercisePhaseTeam->getMembers()->contains($user));
    }

    private function canGetToNextPhase(ExercisePhase $exercisePhase, User $user)
    {
        if ($exercisePhase->getBelongsToExcercise()->getCreator() === $user) {
            return true;
        }
        return $exercisePhase->getTeams()->exists(fn($i, ExercisePhaseTeam $exercisePhaseTeam) => $exercisePhaseTeam->hasSolution() && $exercisePhaseTeam->getMembers()->contains($user));
    }

    // TODO can only delete exercisePhases which have no results/teams
    private function canDelete(ExercisePhase $exercisePhase, User $user)
    {
        return $user === $exercisePhase->getBelongsToExcercise()->getCreator();
    }

    private function canShowSolutions(ExercisePhase $exercisePhase, User $user)
    {
        return $user === $exercisePhase->getBelongsToExcercise()->getCreator();
    }
}
