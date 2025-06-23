<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250623114929 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE autosaved_solution DROP FOREIGN KEY FK_C210BDD7296CD8AE');
        $this->addSql('ALTER TABLE autosaved_solution ADD CONSTRAINT FK_C210BDD7296CD8AE FOREIGN KEY (team_id) REFERENCES exercise_phase_team (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE autosaved_solution DROP FOREIGN KEY FK_C210BDD7296CD8AE');
        $this->addSql('ALTER TABLE autosaved_solution ADD CONSTRAINT FK_C210BDD7296CD8AE FOREIGN KEY (team_id) REFERENCES exercise_phase_team (id)');
    }
}
