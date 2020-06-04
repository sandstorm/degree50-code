<?php

declare(strict_types=1);

namespace App\Tests\Behat;

use Doctrine\DBAL\DBALException;
use Doctrine\Migrations\Migrator;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;

trait DatabaseFixtureContextTrait
{


    /**
     * @var \Doctrine\DBAL\Schema\Schema
     */
    protected static $databaseSchema;

    /**
     * @BeforeScenario @fixtures
     */
    public function resetTestFixtures($event): void
    {
        $this->entityManager->clear();

        if (self::$databaseSchema !== null) {
            $this->truncateTables($this->entityManager);
        } else {
            try {
                $app = new Application($this->kernel);
                $cmd = $app->find('doctrine:migrations:migrate');
                $cmd->run(new ArrayInput([]), new NullOutput());
                $needsTruncate = true;
            } catch (DBALException $exception) {

                $schemaTool = new SchemaTool($this->entityManager);
                $schemaTool->dropDatabase();

                $app = new Application($this->kernel);
                $cmd = $app->find('doctrine:migrations:migrate');
                $cmd->run(new ArrayInput([]), new NullOutput());

                $needsTruncate = false;
            }

            $schema = $this->entityManager->getConnection()->getSchemaManager()->createSchema();
            self::$databaseSchema = $schema;

            if ($needsTruncate) {
                $this->truncateTables($this->entityManager);
            }

            // FIXME Check if this is needed at all!
            //$proxyFactory = $entityManager->getProxyFactory();
            //$proxyFactory->generateProxyClasses($entityManager->getMetadataFactory()->getAllMetadata());
        }

        //$this->resetFactories();
    }

    /**
     * Truncate all known tables
     *
     * @param EntityManagerInterface $entityManager
     * @return void
     */
    private static function truncateTables(EntityManagerInterface $entityManager): void
    {
        $connection = $entityManager->getConnection();

        $tables = array_filter(self::$databaseSchema->getTables(), function ($table) {
            return $table->getName() !== 'migration_versions';
        });
        switch ($connection->getDatabasePlatform()->getName()) {
            case 'mysql':
                $sql = 'SET FOREIGN_KEY_CHECKS=0;';
                foreach ($tables as $table) {
                    $sql .= 'TRUNCATE `' . $table->getName() . '`;';
                }
                $sql .= 'SET FOREIGN_KEY_CHECKS=1;';
                $connection->executeQuery($sql);
                break;
            case 'postgresql':
            default:
                foreach ($tables as $table) {
                    $sql = 'TRUNCATE ' . $table->getName() . ' CASCADE;';
                    $connection->executeQuery($sql);
                }
                break;
        }
    }
}
