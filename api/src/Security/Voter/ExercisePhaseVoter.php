<?php


namespace App\Security\Voter;


use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\ExercisePhaseTeam;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExercisePhaseVoter extends Voter
{
    const NEXT = 'next';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::NEXT])) {
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
            case self::NEXT:
                return $this->canGetToNextPhase($exercisePhase, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }


    private function canGetToNextPhase(ExercisePhase $exercisePhase, User $user)
    {
        return $exercisePhase->getTeams()->exists(fn($i, ExercisePhaseTeam $exercisePhaseTeam) => $exercisePhaseTeam->hasSolution() && $exercisePhaseTeam->getMembers()->contains($user));
    }
}
