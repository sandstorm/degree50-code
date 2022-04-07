<?php

namespace App\Admin\Controller;

use App\Entity\Fachbereich;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
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
