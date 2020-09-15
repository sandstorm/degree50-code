<?php

namespace App\Admin\Controller;

use App\Entity\Account\User;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
 */
class UserCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureFields(string $pageName): iterable
    {
        $id = IdField::new('id');
        $name = TextField::new('email');
        $isAdmin = BooleanField::new('isAdmin');
        $isStudent = BooleanField::new('isStudent');
        $isDozent = BooleanField::new('isDozent');

        if (Crud::PAGE_INDEX === $pageName) {
            return[$id, $name, $isAdmin, $isStudent, $isDozent];
        } elseif (Crud::PAGE_DETAIL === $pageName) {
            return [$id, $name, $isAdmin, $isStudent, $isDozent];
        } elseif (Crud::PAGE_NEW === $pageName) {
            return [$name, $isAdmin, $isStudent, $isDozent];
        } elseif (Crud::PAGE_EDIT === $pageName) {
            return [$name, $isAdmin, $isStudent, $isDozent];
        }
    }
}
