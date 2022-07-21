<?php

namespace App\Service;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use Behat\Behat\Tester\Exception\PendingException;

class UserMaterialService
{
    /**
     *
     * @param User $user
     * // TODO return new Entity we have to implement for Material
     */
    public function getMaterialsForUser(User $user): array
    {
        throw new PendingException();
    }

    /**
     * Create new Material entity from team solution.
     * TODO: new entity
     *
     * @param User $user
     * @param ExercisePhaseTeam $exercisePhaseTeam
     * @param string|null $id
     * @return void
     */
    public function createMaterialForUser(User $user, ExercisePhaseTeam $exercisePhaseTeam, string $id = null): void
    {

    }
}
