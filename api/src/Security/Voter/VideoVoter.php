<?php


namespace App\Security\Voter;


use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Video\Video;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class VideoVoter extends Voter
{

    const EDIT = 'edit';
    const DELETE = 'delete';

    protected function supports(string $attribute, $subject)
    {
        if (!in_array($attribute, [self::EDIT, self::DELETE])) {
            return false;
        }

        if (!$subject instanceof Video) {
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

        /** @var Video $video */
        $video = $subject;

        switch ($attribute) {
            case self::EDIT or self::DELETE:
                return $this->canEditOrDelete($video, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }


    private function canEditOrDelete(Video $video, User $user)
    {
        return $user === $video->getCreator();
    }
}
