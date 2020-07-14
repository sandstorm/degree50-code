<?php

namespace App\Command;

use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Account\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class SetAdminCommand extends Command
{
    protected static $defaultName = 'app:set-admin';

    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager, DoctrineIntegratedEventStore $eventStore)
    {
        parent::__construct();
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->eventStore = $eventStore;
    }


    protected function configure()
    {
        $this
            ->setDescription('')
            ->addArgument('email', InputArgument::REQUIRED, 'Email of new user')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            $io->error('User not found');
            return 1;
        }

        if ($user->isAdmin()) {
            $io->warning('User is already admin; not doing anything.');
            return 0;
        }

        $user->setIsAdmin(true);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success('Updated user (made him admin)');

        return 0;
    }
}
