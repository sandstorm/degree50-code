<?php

namespace App\Command;

use App\EventStore\Storage\EventStorageInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SetupEventStoreCommand extends Command
{
    protected static $defaultName = 'app:eventstore:setup';

    /**
     * SetupEventStoreCommand constructor.
     * @param EventStorageInterface $eventStorageInterface
     */
    public function __construct(
        private readonly EventStorageInterface $eventStorageInterface
    )
    {
        parent::__construct();
    }


    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->eventStorageInterface->setup();
        return 0;
    }
}
