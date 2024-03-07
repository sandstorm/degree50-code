<?php


namespace App\Security\Voter;


use App\Admin\Service\UserService;
use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\Entity\Video\Video;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class VideoVoter extends Voter
{
    const VIEW = 'view';
    const FAVOR = 'favor';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const CREATE = 'create';

    private UserService $userService;

    function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    protected function supports(string $attribute, $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::EDIT, self::DELETE, self::FAVOR, self::CREATE])) {
            return false;
        }

        // only vote on Video objects inside this voter
        // exclude the CREATE attribute from this check, as we want to allow the creation of videos where no subject is given
        if (!$subject instanceof Video && $attribute !== self::CREATE) {
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

        /** @var Video $video */
        $video = $subject;

        switch ($attribute) {
            case self::CREATE:
                return $this->canCreate($user);
            case self::VIEW:
                return $this->canView($video, $user);
            case self::EDIT:
                return $this->canEdit($video, $user);
            case self::DELETE:
                return $this->canDelete($video, $user);
            case self::FAVOR:
                return $this->canFavor($user);
        }

        throw new LogicException('This code should not be reached!');
    }

    private function canFavor(User $user): bool
    {
        // Currently only students do have a "Schreibtisch" and are therefore able
        // to add videos to their favorites.
        return $user->isStudent();
    }

    private function canView(Video $video, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user === $video->getCreator()) {
            return true;
        }

        // Check if the video is assigned to courses and if the user is in any of those assigned courses
        $videoCourses = $video->getCourses();
        $userCourseRoles = $user->getCourseRoles();

        if ($videoCourses->count() < 1 || $userCourseRoles->count() < 1) {
            return false;
        }

        $userCourses = $user->getCourseRoles()->map(function (CourseRole $courseRole) {
            return $courseRole->getCourse();
        });

        return $videoCourses->exists(function ($_, Course $course) use ($userCourses) {
            return $userCourses->contains($course);
        });
    }

    private function canEdit(Video $video, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return $user === $video->getCreator();
    }

    private function canDelete(Video $video, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return $user === $video->getCreator();
    }

    private function canCreate(User $user): bool
    {
        return $this->userService->canUploadVideo($user);
    }
}
