<?php

namespace App\Admin\Controller;

use App\Entity\Account\User;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;

/**
 * @IsGranted("ROLE_ADMIN")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class DashboardController extends AbstractDashboardController
{
    private AdminUrlGenerator $adminUrlGenerator;

    public function __construct(AdminUrlGenerator $adminUrlGenerator)
    {
        $this->adminUrlGenerator = $adminUrlGenerator;
    }

    /**
     * @Route("/admin")
     */
    public function index(): Response
    {
        // redirect to some CRUD controller
        $url = $this->adminUrlGenerator
            ->setController(UserCrudController::class)
            ->generateUrl();

        return $this->redirect($url);

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
    }
}
