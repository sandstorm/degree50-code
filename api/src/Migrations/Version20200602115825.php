<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200602115825 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE material (id INT AUTO_INCREMENT NOT NULL, exercise_phase_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', name VARCHAR(255) NOT NULL, link VARCHAR(255) NOT NULL, uploadAt DATETIME NOT NULL, INDEX IDX_7CBE75959F65B160 (exercise_phase_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE material ADD CONSTRAINT FK_7CBE75959F65B160 FOREIGN KEY (exercise_phase_id) REFERENCES exercise_phase (id)');
        $this->addSql('ALTER TABLE video_cut_list CHANGE cut_list cut_list JSON NOT NULL');
        $this->addSql('ALTER TABLE video_subtitles CHANGE subtitles subtitles JSON NOT NULL');
        $this->addSql('ALTER TABLE video CHANGE subtitles_id subtitles_id INT DEFAULT NULL, CHANGE uploaded_video_file_virtual_path_and_filename uploaded_video_file_virtual_path_and_filename VARCHAR(255) DEFAULT NULL, CHANGE encoded_video_directory_virtual_path_and_filename encoded_video_directory_virtual_path_and_filename VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE autosaved_solution CHANGE owner_id owner_id INT DEFAULT NULL, CHANGE solution solution JSON NOT NULL');
        $this->addSql('ALTER TABLE exercise_phase CHANGE belongs_to_excercise_id belongs_to_excercise_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE exercise_phase_team CHANGE solution_id solution_id INT DEFAULT NULL, CHANGE current_editor_id current_editor_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE exercise CHANGE course_id course_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE solution CHANGE solution solution JSON NOT NULL');
        $this->addSql('ALTER TABLE user CHANGE roles roles JSON NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE material');
        $this->addSql('ALTER TABLE autosaved_solution CHANGE owner_id owner_id INT DEFAULT NULL, CHANGE solution solution LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE exercise CHANGE course_id course_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE exercise_phase CHANGE belongs_to_excercise_id belongs_to_excercise_id CHAR(36) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE exercise_phase_team CHANGE solution_id solution_id INT DEFAULT NULL, CHANGE current_editor_id current_editor_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE solution CHANGE solution solution LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE user CHANGE roles roles LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE video CHANGE subtitles_id subtitles_id INT DEFAULT NULL, CHANGE uploaded_video_file_virtual_path_and_filename uploaded_video_file_virtual_path_and_filename VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci`, CHANGE encoded_video_directory_virtual_path_and_filename encoded_video_directory_virtual_path_and_filename VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE video_cut_list CHANGE cut_list cut_list LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
        $this->addSql('ALTER TABLE video_subtitles CHANGE subtitles subtitles LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`');
    }
}
