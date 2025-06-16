<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Query;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613073827 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course ADD expiration_date DATETIME NOT NULL, ADD expiration_notification_sent TINYINT(1) NOT NULL');

        // Set default expiration date to 2 years after creation date for all existing courses
        $this->addSql('UPDATE course SET expiration_date = DATE_ADD(creation_date, INTERVAL 2 YEAR), expiration_notification_sent = 0 WHERE expiration_date < creation_date');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course DROP expiration_date, DROP expiration_notification_sent');
    }
}
