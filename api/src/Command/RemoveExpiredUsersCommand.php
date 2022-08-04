<?php

namespace App\Command;

use App\Admin\Controller\UserService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class RemoveExpiredUsersCommand extends Command
{
    private UserService $userService;

    protected static $defaultName = 'app:remove-expired-users';

    public function __construct(UserService $userService)
    {
        parent::__construct();
        $this->userService = $userService;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->writeln('Deleting all expired users..');

        $io->listing($this->userService->removeAllExpiredUsers());

        $io->success('Deleted all expired users');

        return 0;
    }
}
