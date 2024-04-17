<?php

namespace App\Admin\Service;

use App\Domain\Account\User;
use App\Domain\Exercise\ExercisePhaseTeam;
use App\Domain\Material\Material;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Material\MaterialRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;

class UserMaterialService
{

    function __construct(
        private readonly EntityManagerInterface       $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore,
        private readonly MaterialRepository           $materialRepository,
    )
    {
    }

    /**
     *
     * @param User $user
     * @return Material[]
     */
    public function getMaterialsForUser(User $user): array
    {
        return $this->materialRepository->findByOwner($user);
    }

    public function updateMaterial(Material $material, string $newValue)
    {
        $material->setMaterial($newValue);
        $material->setLastUpdatedAt(new DateTimeImmutable());

        $this->eventStore->addEvent('MaterialUpdated', [
            'materialId' => $material->getId(),
        ]);

        $this->entityManager->persist($material);
        $this->entityManager->flush();
    }

    /**
     * Create a unique material for each member of an exercisePhaseTeam which is derived
     * from their final submitted solution.
     * The material can then be accessed and edited by each individual user on their "Schreibtisch"
     **/
    public function createMaterialsForExercisePhaseTeamMembers(ExercisePhaseTeam $exercisePhaseTeam)
    {
        $members = $exercisePhaseTeam->getMembers();

        foreach ($members as $_key => $member) {
            $this->createMaterialForUser($member, $exercisePhaseTeam);
        }
    }

    /**
     * Create new Material entity from team solution.
     *
     * @param User $user
     * @param ExercisePhaseTeam $exercisePhaseTeam
     * @param string|null $id
     * @return void
     */
    public function createMaterialForUser(User $user, ExercisePhaseTeam $exercisePhaseTeam, string $id = null): void
    {
        $newMaterial = new Material($id);
        $newMaterial->setOwner($user);
        $newMaterial->setOriginalPhaseTeam($exercisePhaseTeam);
        $newMaterial->setCreatedAt(new DateTimeImmutable());
        $solution = $exercisePhaseTeam->getSolution();

        if (is_null($solution)) {
            // NoOp
            return;
        }

        $newMaterial->setMaterial($solution->getSolution()->getMaterial()->toString());

        $this->eventStore->addEvent('MaterialCreated', [
            'materialId' => $newMaterial->getId(),
            'ownerId' => $user->getId(),
        ]);

        $this->entityManager->persist($newMaterial);
        $this->entityManager->flush();
    }

    public function deleteMaterialsOfUser(User $user): void
    {
        $this->materialRepository->removeAllMaterialsOfUser($user);
    }
}
