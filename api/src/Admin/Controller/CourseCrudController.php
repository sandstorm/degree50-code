<?php

namespace App\Admin\Controller;

use App\Admin\Form\InlineCourseRoleType;
use App\Entity\Account\Course;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
 */
class CourseCrudController extends AbstractCrudController
{
    private EntityManagerInterface $entityManager;

    /**
     * CourseCrudController constructor.
     * @param EntityManagerInterface $entityManager
     */
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }


    public static function getEntityFqcn(): string
    {
        return Course::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        $this->entityManager->getFilters()->disable('course_doctrine_filter');
        return $crud
            ->setEntityLabelInSingular('Course')
            ->setEntityLabelInPlural('Course')
            ->setSearchFields(['name', 'id']);
    }

    public function configureFields(string $pageName): iterable
    {
        $name = TextField::new('name');
        $courseRoles = CollectionField::new('courseRoles')->setEntryType(InlineCourseRoleType::class);
        $creationDate = DateTimeField::new('creationDate');
        $id = TextField::new('id', 'ID');
        $exercises = AssociationField::new('exercises');

        if (Crud::PAGE_INDEX === $pageName) {
            return [$name, $creationDate, $exercises, $courseRoles];
        } elseif (Crud::PAGE_DETAIL === $pageName) {
            return [$name, $creationDate, $id, $exercises, $courseRoles];
        } elseif (Crud::PAGE_NEW === $pageName) {
            return [$name];
        } elseif (Crud::PAGE_EDIT === $pageName) {
            return [$name, $courseRoles];
        }
    }

    public function updateEntity(EntityManagerInterface $entityManager, $entityInstance): void {
        $course = $entityInstance;

        // Ensure every CourseRole has its reference to the corresponding
        // $course defined.

        /* @var $course \App\Entity\Account\Course */
        assert($course instanceof Course);
        foreach ($course->getCourseRoles() as $courseRole) {
            $courseRole->setCourse($course);
        }
        parent::updateEntity($entityManager, $entityInstance);
    }
}
