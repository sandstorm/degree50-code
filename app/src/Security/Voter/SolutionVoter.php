<?php


namespace App\Security\Voter;


use App\Domain\Account\User;
use App\Domain\Exercise\Solution;
use App\Exercise\Controller\ExerciseService;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class SolutionVoter extends Voter
{
    const REVIEW_SOLUTION = 'reviewSolution';

    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;

    public function __construct(ExercisePhaseTeamRepository $exercisePhaseTeamRepository)
    {
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
    }

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

        $course = $this->exercisePhaseTeamRepository
            ->findBySolution($solution)
            ->getExercisePhase()
            ->getBelongsToExercise()
            ->getCourse();

        // check if Dozent has access to course
        return ExerciseService::userIsCourseDozent($user, $course);
    }
}
