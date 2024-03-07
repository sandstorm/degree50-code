<?php

namespace App\Admin\Service;

use App\Entity\Account\User;

class UserExpirationService
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getExpirationDate(): string
    {
        $user = $this->userService->getLoggendInUser();

        if (is_null($user)) {
            return false;
        }

        return $user->getExpirationDate()->format('j. F Y');
    }

    public function isUserExpiringSoon(): bool
    {
        $user = $this->userService->getLoggendInUser();

        if (is_null($user)) {
            return false;
        }

        if ($user->isDozent() || $user->isAdmin())
        {
            return false;
        }

        $now = new \DateTimeImmutable();
        $noticeInterval = \DateInterval::createFromDateString(User::EXPIRATION_NOTICE_DURATION_STRING);

        // expiration_date - notice_duration < now
        return $user->getExpirationDate()->sub($noticeInterval) < $now;
    }

    public function increaseExpirationDateForUserByOneYear(): void
    {
        $user = $this->userService->getLoggendInUser();

        if (is_null($user)) {
            return;
        }

        $this->userService->increaseUserExpirationDateByOneYear($user);
    }
}
