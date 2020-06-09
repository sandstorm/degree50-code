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

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::JOIN, self::CREATE])) {
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
            case self::JOIN:
                return $this->canJoin($exercisePhaseTeam, $user);
            case self::CREATE:
                return $this->canCreate($exercisePhase, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }


    private function canJoin(ExercisePhaseTeam $exercisePhaseTeam, User $user)
    {
        if ($exercisePhaseTeam->getMembers()->contains($user)) {
            return false;
        }

        if (!$this->canCreate($exercisePhaseTeam->getExercisePhase(), $user)) {
            return false;
        }

        // if user has created a other team...?

        return true;
    }

    private function canCreate(ExercisePhase $exercisePhase, User $user)
    {
        $existingTeams = $exercisePhase->getTeams();
        $canCreate = true;
        foreach($existingTeams as $team) {
            if ($team->getCreator() === $user) {
                $canCreate = false;
            }
        }

        return $canCreate;
    }
}
