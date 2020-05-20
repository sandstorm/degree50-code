<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200520063614 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE video_cut_list (id INT AUTO_INCREMENT NOT NULL, cut_list JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE video_subtitles (id INT AUTO_INCREMENT NOT NULL, subtitles JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE autosaved_solution (id INT AUTO_INCREMENT NOT NULL, owner_id INT DEFAULT NULL, team_id INT NOT NULL, solution JSON NOT NULL, update_timestamp DATETIME NOT NULL COMMENT \'(DC2Type:datetimetz_immutable)\', INDEX IDX_C210BDD77E3C61F9 (owner_id), INDEX IDX_C210BDD7296CD8AE (team_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE exercise_phase_team (id INT AUTO_INCREMENT NOT NULL, exercise_phase_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', solution_id INT DEFAULT NULL, current_editor_id INT DEFAULT NULL, INDEX IDX_7416C7519F65B160 (exercise_phase_id), UNIQUE INDEX UNIQ_7416C7511C0BE183 (solution_id), INDEX IDX_7416C751B2B31DE0 (current_editor_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE exercise_phase_team_user (exercise_phase_team_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_6DA7F5A67B50751B (exercise_phase_team_id), INDEX IDX_6DA7F5A6A76ED395 (user_id), PRIMARY KEY(exercise_phase_team_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE solution (id INT AUTO_INCREMENT NOT NULL, solution JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE course (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE course_role (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, course_id INT NOT NULL, INDEX IDX_9FCB576CA76ED395 (user_id), INDEX IDX_9FCB576C591CC992 (course_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE autosaved_solution ADD CONSTRAINT FK_C210BDD77E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE autosaved_solution ADD CONSTRAINT FK_C210BDD7296CD8AE FOREIGN KEY (team_id) REFERENCES exercise_phase_team (id)');
        $this->addSql('ALTER TABLE exercise_phase_team ADD CONSTRAINT FK_7416C7519F65B160 FOREIGN KEY (exercise_phase_id) REFERENCES exercise_phase (id)');
        $this->addSql('ALTER TABLE exercise_phase_team ADD CONSTRAINT FK_7416C7511C0BE183 FOREIGN KEY (solution_id) REFERENCES solution (id)');
        $this->addSql('ALTER TABLE exercise_phase_team ADD CONSTRAINT FK_7416C751B2B31DE0 FOREIGN KEY (current_editor_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE exercise_phase_team_user ADD CONSTRAINT FK_6DA7F5A67B50751B FOREIGN KEY (exercise_phase_team_id) REFERENCES exercise_phase_team (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE exercise_phase_team_user ADD CONSTRAINT FK_6DA7F5A6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE course_role ADD CONSTRAINT FK_9FCB576CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE course_role ADD CONSTRAINT FK_9FCB576C591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('DROP TABLE account');
        $this->addSql('ALTER TABLE video ADD subtitles_id INT DEFAULT NULL, CHANGE uploaded_video_file_virtual_path_and_filename uploaded_video_file_virtual_path_and_filename VARCHAR(255) DEFAULT NULL, CHANGE encoded_video_directory_virtual_path_and_filename encoded_video_directory_virtual_path_and_filename VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE video ADD CONSTRAINT FK_7CC7DA2CC6C446AA FOREIGN KEY (subtitles_id) REFERENCES video_subtitles (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7CC7DA2CC6C446AA ON video (subtitles_id)');
        $this->addSql('ALTER TABLE exercise_phase CHANGE belongs_to_excercise_id belongs_to_excercise_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE video DROP FOREIGN KEY FK_7CC7DA2CC6C446AA');
        $this->addSql('ALTER TABLE autosaved_solution DROP FOREIGN KEY FK_C210BDD7296CD8AE');
        $this->addSql('ALTER TABLE exercise_phase_team_user DROP FOREIGN KEY FK_6DA7F5A67B50751B');
        $this->addSql('ALTER TABLE exercise_phase_team DROP FOREIGN KEY FK_7416C7511C0BE183');
        $this->addSql('ALTER TABLE autosaved_solution DROP FOREIGN KEY FK_C210BDD77E3C61F9');
        $this->addSql('ALTER TABLE exercise_phase_team DROP FOREIGN KEY FK_7416C751B2B31DE0');
        $this->addSql('ALTER TABLE exercise_phase_team_user DROP FOREIGN KEY FK_6DA7F5A6A76ED395');
        $this->addSql('ALTER TABLE course_role DROP FOREIGN KEY FK_9FCB576CA76ED395');
        $this->addSql('ALTER TABLE course_role DROP FOREIGN KEY FK_9FCB576C591CC992');
        $this->addSql('CREATE TABLE account (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, roles LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_bin`, password VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, UNIQUE INDEX UNIQ_7D3656A4E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('DROP TABLE video_cut_list');
        $this->addSql('DROP TABLE video_subtitles');
        $this->addSql('DROP TABLE autosaved_solution');
        $this->addSql('DROP TABLE exercise_phase_team');
        $this->addSql('DROP TABLE exercise_phase_team_user');
        $this->addSql('DROP TABLE solution');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE course');
        $this->addSql('DROP TABLE course_role');
        $this->addSql('ALTER TABLE exercise_phase CHANGE belongs_to_excercise_id belongs_to_excercise_id CHAR(36) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('DROP INDEX UNIQ_7CC7DA2CC6C446AA ON video');
        $this->addSql('ALTER TABLE video DROP subtitles_id, CHANGE uploaded_video_file_virtual_path_and_filename uploaded_video_file_virtual_path_and_filename VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci`, CHANGE encoded_video_directory_virtual_path_and_filename encoded_video_directory_virtual_path_and_filename VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'NULL\' COLLATE `utf8mb4_unicode_ci`');
    }
}
