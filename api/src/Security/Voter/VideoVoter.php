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
            case self::EDIT:
                return $this->canEdit($video, $user);
            case self::DELETE:
                return $this->canDelete($video, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }


    private function canEdit(Video $video, User $user)
    {
        return $user === $video->getCreator();
    }

    private function canDelete(Video $video, User $user)
    {
        return $user === $video->getCreator();
    }
}
