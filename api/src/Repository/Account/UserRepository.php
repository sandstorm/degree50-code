<?php

namespace App\Repository\Account;

use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use function get_class;

/**
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    private DoctrineIntegratedEventStore $eventStore;

    public function __construct(ManagerRegistry $registry, DoctrineIntegratedEventStore $eventStore)
    {
        parent::__construct($registry, User::class);

        $this->eventStore = $eventStore;
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(UserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        $user->setPassword($newHashedPassword);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->_em->persist($user);
        $this->_em->flush();
    }

    /**
     * @return User[]
     */
    public function findAllExpiredUsers(): array
    {
        $now = new \DateTimeImmutable();
        return $this->createQueryBuilder('user')
            ->where('user.expirationDate < :now')
            ->setParameter('now', $now->format(User::DB_DATE_FORMAT))
            ->getQuery()
            ->getResult();
    }
}
