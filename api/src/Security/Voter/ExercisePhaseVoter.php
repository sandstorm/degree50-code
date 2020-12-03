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
    const CREATE_TEAM = 'createTeam';
    const VIEW_OTHER_SOLUTIONS = 'viewOtherSolutions';
    const VIEW = 'viewExercisePhase';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::SHOW, self::NEXT, self::DELETE, self::SHOW_SOLUTIONS, self::CREATE_TEAM, self::VIEW_OTHER_SOLUTIONS, self::VIEW])) {
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
            case self::CREATE_TEAM:
                return $this->canCreateTeam($exercisePhase, $user);
            case self::VIEW_OTHER_SOLUTIONS:
                return $this->canViewOtherSolutions($exercisePhase, $user);
            case self::VIEW:
                return $this->canViewExercisePhase($exercisePhase, $user);

        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canShow(ExercisePhase $exercisePhase, User $user)
    {
        return $exercisePhase->getTeams()->exists(fn($i, ExercisePhaseTeam $exercisePhaseTeam) => $exercisePhaseTeam->getMembers()->contains($user));
    }

    /**
     * User can view this ExercisePhase.
     * He can if it's the first or the user has a Solution for the previous ExercisePhase.
     *
     * @param ExercisePhase $exercisePhase
     * @param User $user
     * @return bool
     */
    private function canViewExercisePhase(ExercisePhase $exercisePhase, User $user)
    {
        if ($exercisePhase->getBelongsToExercise()->getCreator() === $user) {
            return true;
        }

        // check if previous ExercisePhase exists or has solution
        $sortingPosition = $exercisePhase->getSorting();

        // is first ExercisePhase
        if ($sortingPosition === 0) {
            return true;
        }

        $previousExercisePhaseHasSolution = $exercisePhase
            ->getBelongsToExercise()
            ->getPhaseAtSortingPosition($sortingPosition - 1)
            ->getHasSolutionForUser($user);

        if ($previousExercisePhaseHasSolution) {
            return true;
        }

        return false;
    }

    private function canViewOtherSolutions(ExercisePhase $exercisePhase, User $user): bool
    {
        // FIXME
        // As there is a bug that crashes the app if the user himself (even the admin) has not
        // yet has startet the phase once (and thus created a Team -> which causes the crash)
        if ($exercisePhase->getHasSolutionForUser($user)) {
            return $exercisePhase->getOtherSolutionsAreAccessible() || $exercisePhase->getBelongsToExercise()->getCreator() === $user;
        }

        return false;
    }

    private function canGetToNextPhase(ExercisePhase $exercisePhase, User $user)
    {
        if ($exercisePhase->getBelongsToExercise()->getCreator() === $user) {
            return true;
        }

        return $exercisePhase->getHasSolutionForUser($user);
    }

    // TODO can only delete exercisePhases which have no results/teams
    private function canDelete(ExercisePhase $exercisePhase, User $user)
    {
        return $user === $exercisePhase->getBelongsToExercise()->getCreator();
    }

    private function canShowSolutions(ExercisePhase $exercisePhase, User $user)
    {
        return $user === $exercisePhase->getBelongsToExercise()->getCreator();
    }

    private function canCreateTeam(ExercisePhase $exercisePhase, User $user): bool
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
