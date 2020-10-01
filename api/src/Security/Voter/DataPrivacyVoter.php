<?php


namespace App\Security\Voter;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Video\Video;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class DataPrivacyVoter extends Voter
{

    const ACCEPTED = 'data-privacy-accepted';

    public function supports($attribute, $subject)
    {
        return $attribute === self::ACCEPTED;
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token)
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            // the user must be logged in; if not, deny access
            return false;
        }

        return $user->getDataPrivacyAccepted();
    }
}
