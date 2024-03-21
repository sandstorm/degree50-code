<?php

namespace App\Admin\Service;

use App\Repository\Account\UserRepository;

/**
 * Most of the email validation logic is done in SymfonyCasts\Bundle\VerifyEmail.
 *
 * This Service handles the domain specific use cases.
 */
class UserEmailValidationService
{
    private UserService $userService;
    private UserRepository $userRepository;

    public function __construct(UserService $userService, UserRepository $userRepository)
    {
        $this->userService = $userService;
        $this->userRepository = $userRepository;
    }

    /**
     * @return string[] Ids of deleted users
     */
    public function removeAllUsersWithVerificationTimeout(): array
    {
        $usersWithVerificationTimeout = $this->userRepository->findAllUsersWithVerificationTimeout();
        $studentIds = [];

        foreach ($usersWithVerificationTimeout as $user) {
            if ($user->isAdmin() || $user->isDozent()) {
                continue;
            }

            $studentIds[] = $user->getId();
            $this->userService->deleteStudent($user);
        }

        return $studentIds;
    }
}
