<?php

namespace App\Security\DoctrineFilter;

use App\Domain\User\Model\User;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

class AbstractDoctrineFilter extends SQLFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        return '';
    }

    protected function userIsAdmin(): bool
    {
        if ($this->hasParameter('userRoles')) {
            $userRolesAsJsonString = stripslashes(substr($this->getParameter('userRoles'), 1, -1));
            $userRoles = json_decode($userRolesAsJsonString);
            return in_array(User::ROLE_ADMIN, $userRoles);
        }

        return false;
    }
}
