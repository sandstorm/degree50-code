<?php


namespace App\Security\DoctrineFilter;


use App\Entity\Account\Course;
use Doctrine\ORM\Mapping\ClassMetadata;

/**
 *
 * FILTER PARAMETERS:
 *
 * - userId: the User ID of the user.
 *
 */
class CourseDoctrineFilter extends AbstractDoctrineFilter
{

    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        if ($targetEntity->getName() !== Course::class) {
            return '';
        }
        $userId = $this->getParameter('userId');
        // we disable the filter if the current user is an ADMIN
        if (parent::userIsAdmin()) {
            return '';
        }

        return sprintf('%s.id IN (SELECT course_role.course_id FROM course_role WHERE course_role.user_id = %s)', $targetTableAlias, $userId);
    }
}
