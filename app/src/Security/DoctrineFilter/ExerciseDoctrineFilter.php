<?php

namespace App\Security\DoctrineFilter;

use App\Domain\Exercise\Model\Exercise;
use Doctrine\ORM\Mapping\ClassMetadata;

/**
 *
 * FILTER PARAMETERS:
 *
 * - userId: the User ID of the user.
 *
 */
class ExerciseDoctrineFilter extends AbstractDoctrineFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        return '';
        if ($targetEntity->getName() !== Exercise::class) {
            return '';
        }
        $userId = $this->getParameter('userId');
        // we disable the filter if the current user is an ADMIN
        if (parent::userIsAdmin()) {
            return '';
        }

        return sprintf('%s.course_id IN (SELECT course_role.course_id FROM course_role WHERE course_role.user_id = %s)', $targetTableAlias, $userId);
    }
}
