<?php

namespace App\Command;

use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class CreateUserCommand extends Command
{
    protected static $defaultName = 'app:create-user';

    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $userPasswordHasher;
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(EntityManagerInterface $entityManager, UserPasswordHasherInterface $userPasswordHasher, DoctrineIntegratedEventStore $eventStore)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->userPasswordHasher = $userPasswordHasher;
        $this->eventStore = $eventStore;
    }


    protected function configure()
    {
        $this
            ->setDescription('Create a new user')
            ->addArgument('email', InputArgument::REQUIRED, 'Email of new user')
            ->addArgument('password', InputArgument::REQUIRED, 'Password of new user')
            ->addOption('admin', null, InputOption::VALUE_NONE, 'should the new user be admin?');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $isAdmin = $input->getOption('admin');

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->userPasswordHasher->hashPassword(
            $user,
            $password
        ));
        $user->setIsAdmin($isAdmin);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success('Created new user');

        return 0;
    }
}
