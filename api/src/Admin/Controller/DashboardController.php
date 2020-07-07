<?php

namespace App\Admin\Controller;

use App\Entity\Account\Course;
use App\Entity\Video\VideoCode;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Router\CrudUrlGenerator;


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
        return Crud::new();
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToCrud('VideoCode', 'fas fa-folder-open', VideoCode::class);
        yield MenuItem::linkToCrud('Course', 'fas fa-folder-open', Course::class);
    }
}
