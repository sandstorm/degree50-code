<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200529141951 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE video_cut_list CHANGE cut_list cut_list JSON NOT NULL');
        $this->addSql('ALTER TABLE video_subtitles CHANGE subtitles subtitles JSON NOT NULL');
        $this->addSql('ALTER TABLE video CHANGE subtitles_id subtitles_id INT DEFAULT NULL, CHANGE uploaded_video_file_virtual_path_and_filename uploaded_video_file_virtual_path_and_filename VARCHAR(255) DEFAULT NULL, CHANGE encoded_video_directory_virtual_path_and_filename encoded_video_directory_virtual_path_and_filename VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE autosaved_solution CHANGE owner_id owner_id INT DEFAULT NULL, CHANGE solution solution JSON NOT NULL');
        $this->addSql('ALTER TABLE exercise_phase DROP type, CHANGE belongs_to_excercise_id belongs_to_excercise_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE exercise_phase_team CHANGE solution_id solution_id INT DEFAULT NULL, CHANGE current_editor_id current_editor_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE exercise CHANGE course_id course_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE solution CHANGE solution solution JSON NOT NULL');
        $this->addSql('ALTER TABLE user CHANGE roles roles JSON NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE autosaved_solution CHANGE owner_id owner_id INT DEFAULT NULL, CHANGE solution solution LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE exercise CHANGE course_id course_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE exercise_phase ADD type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, CHANGE belongs_to_excercise_id belongs_to_excercise_id CHAR(36) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE exercise_phase_team CHANGE solution_id solution_id INT DEFAULT NULL, CHANGE current_editor_id current_editor_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE solution CHANGE solution solution LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE user CHANGE roles roles LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE video CHANGE subtitles_id subtitles_id INT DEFAULT NULL, CHANGE uploaded_video_file_virtual_path_and_filename uploaded_video_file_virtual_path_and_filename VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci`, CHANGE encoded_video_directory_virtual_path_and_filename encoded_video_directory_virtual_path_and_filename VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE video_cut_list CHANGE cut_list cut_list LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE video_subtitles CHANGE subtitles subtitles LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
    }
}
