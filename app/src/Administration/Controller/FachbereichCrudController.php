<?php

namespace App\Admin\Controller;

use App\Domain\Fachbereich;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class FachbereichCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Fachbereich::class;
    }
}
