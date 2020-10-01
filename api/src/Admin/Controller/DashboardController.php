<?php

namespace App\Admin\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\User;
use App\Entity\Exercise\VideoCode;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Router\CrudUrlGenerator;

/**
 * @IsGranted("ROLE_ADMIN")
 * @IsGranted("data-privacy-accepted")
 */
class DashboardController extends AbstractDashboardController
{
    /**
     * @Route("/admin")
     */
    public function index(): Response
    {
        // redirect to some CRUD controller
        $routeBuilder = $this->get(CrudUrlGenerator::class)->build();

        return $this->redirect($routeBuilder->setController(CourseCrudController::class)->generateUrl());

    }

    public function configureAssets(): Assets
    {
        return parent::configureAssets()
            ->addCssFile('/build/admin.css')
            ->addJsFile('/build/runtime.js')
            ->addJsFile('/build/vendors~app.js')
            ->addJsFile('/build/app.js');
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('Degree 4.0 - Administration');
    }

    public function configureCrud(): Crud
    {
        return Crud::new()
            ->setFormThemes(['Form/CustomFormTheme.html.twig', '@EasyAdmin/crud/form_theme.html.twig']);
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToCrud('User', 'fas fa-folder-open', User::class);
        yield MenuItem::linkToCrud('Course', 'fas fa-folder-open', Course::class);
    }
}
