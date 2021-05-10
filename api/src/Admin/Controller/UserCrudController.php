<?php

namespace App\Admin\Controller;

use App\Admin\EventSubscriber\EasyAdminSubscriber;
use App\Entity\Account\User;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;

/**
 * @IsGranted("ROLE_ADMIN")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class UserCrudController extends AbstractCrudController
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureFields(string $pageName): iterable
    {
        $id = IdField::new('id');
        $name = TextField::new('email');

        /**
         * Encrypting is handled by
         * @see EasyAdminSubscriber::encodePassword()
         */
        $password = TextField::new('plain_password', Crud::PAGE_NEW === $pageName ? 'Password' : 'Change password')->setFormType(PasswordType::class);

        $isAdmin = BooleanField::new('isAdmin');
        $isStudent = BooleanField::new('isStudent');
        $isDozent = BooleanField::new('isDozent');

        if (Crud::PAGE_INDEX === $pageName) {
            return[$id, $name, $isAdmin, $isStudent, $isDozent];
        } elseif (Crud::PAGE_DETAIL === $pageName) {
            return [$id, $name, $isAdmin, $isStudent, $isDozent];
        } elseif (Crud::PAGE_NEW === $pageName) {
            $name->setRequired(true);
            $password->setRequired(true);
            return [$name, $password, $isAdmin, $isStudent, $isDozent];
        } elseif (Crud::PAGE_EDIT === $pageName) {
            return [$name, $password, $isAdmin, $isStudent, $isDozent];
        }
    }

    public function deleteEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof User) {
            $this->userService->removeUser($entityInstance);
        } else {
            parent::deleteEntity($entityManager, $entityInstance);
        }
    }

}
