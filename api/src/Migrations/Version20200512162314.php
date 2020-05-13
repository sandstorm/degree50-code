<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200512162314 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('ALTER TABLE video ADD title TEXT NOT NULL');
        $this->addSql('ALTER TABLE video ADD description TEXT NOT NULL');
        $this->addSql('ALTER TABLE video ADD encoded_video_directory_virtual_path_and_filename VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE video DROP updated_at');
        $this->addSql('ALTER TABLE video RENAME COLUMN video TO uploaded_video_file_virtual_path_and_filename');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE video ADD video VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE video ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE video DROP title');
        $this->addSql('ALTER TABLE video DROP description');
        $this->addSql('ALTER TABLE video DROP uploaded_video_file_virtual_path_and_filename');
        $this->addSql('ALTER TABLE video DROP encoded_video_directory_virtual_path_and_filename');
    }
}
