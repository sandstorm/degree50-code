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
    const CREATE = 'create';
    const SHOW = 'show';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::JOIN, self::CREATE, self::SHOW])) {
            return false;
        }

        if (!$subject instanceof ExercisePhaseTeam && !$subject instanceof ExercisePhase) {
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
        }

        if ($subject instanceof ExercisePhase) {
            /** @var ExercisePhase $exercisePhase */
            $exercisePhase = $subject;
        }

        switch ($attribute) {
            case self::SHOW:
                return $this->canShow($exercisePhaseTeam, $user);
            case self::JOIN:
                return $this->canJoin($exercisePhaseTeam, $user);
            case self::CREATE:
                return $this->canCreate($exercisePhase, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canShow(ExercisePhaseTeam $exercisePhaseTeam, User $user)
    {
        return $exercisePhaseTeam->getMembers()->contains($user);
    }


    private function canJoin(ExercisePhaseTeam $exercisePhaseTeam, User $user)
    {
        return $this->canCreate($exercisePhaseTeam->getExercisePhase(), $user);
    }

    private function canCreate(ExercisePhase $exercisePhase, User $user)
    {
        $existingTeams = $exercisePhase->getTeams();
        $canCreate = true;
        foreach($existingTeams as $team) {
            if($team->getMembers()->contains($user)) {
                $canCreate = false;
            }

            if ($team->getCreator() === $user) {
                $canCreate = false;
            }
        }

        return $canCreate;
    }
}
