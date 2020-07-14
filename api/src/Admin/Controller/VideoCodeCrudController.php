<?php

namespace App\Admin\Controller;

use App\Entity\Video\VideoCode;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ColorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
 */
class VideoCodeCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return VideoCode::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setFormThemes(['Form/CustomFormTheme.html.twig', '@EasyAdmin/crud/form_theme.html.twig'])
            ->setEntityLabelInSingular('VideoCode')
            ->setEntityLabelInPlural('VideoCode')
            ->setSearchFields(['name', 'description', 'color', 'id']);
    }

    public function configureFields(string $pageName): iterable
    {
        $name = TextField::new('name');
        $description = TextareaField::new('description');
        $colorPicker = ColorField::new('color');
        $id = TextField::new('id', 'ID');
        $exercisePhases = AssociationField::new('exercisePhases');

        if (Crud::PAGE_INDEX === $pageName) {
            return [$name, $description, $colorPicker];
        } elseif (Crud::PAGE_DETAIL === $pageName) {
            return [$name, $description, $colorPicker, $id, $exercisePhases];
        } elseif (Crud::PAGE_NEW === $pageName) {
            return [$name, $description, $colorPicker];
        } elseif (Crud::PAGE_EDIT === $pageName) {
            return [$name, $description, $colorPicker];
        }
    }
}
