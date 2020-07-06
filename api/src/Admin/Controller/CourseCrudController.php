<?php

namespace App\Admin\Controller;

use App\Entity\Account\Course;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class CourseCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Course::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Course')
            ->setEntityLabelInPlural('Course')
            ->setSearchFields(['name', 'id']);
    }

    public function configureFields(string $pageName): iterable
    {
        $name = TextField::new('name');
        $courseRoles = AssociationField::new('courseRoles');
        $creationDate = DateTimeField::new('creationDate');
        $id = TextField::new('id', 'ID');
        $exercises = AssociationField::new('exercises');

        if (Crud::PAGE_INDEX === $pageName) {
            return [$name, $creationDate, $exercises, $courseRoles];
        } elseif (Crud::PAGE_DETAIL === $pageName) {
            return [$name, $creationDate, $id, $exercises, $courseRoles];
        } elseif (Crud::PAGE_NEW === $pageName) {
            return [$name, $courseRoles];
        } elseif (Crud::PAGE_EDIT === $pageName) {
            return [$name, $courseRoles];
        }
    }
}
