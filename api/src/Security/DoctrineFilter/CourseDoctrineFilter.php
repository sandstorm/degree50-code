<?php


namespace App\Security\DoctrineFilter;


use App\Entity\Account\Course;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

/**
 *
 * FILTER PARAMETERS:
 *
 * - userId: the User ID of the user.
 *
 */
class CourseDoctrineFilter extends SQLFilter
{

    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias)
    {
        if ($targetEntity->getName() !== Course::class) {
            return '';
        }
        $userId = $this->getParameter('userId');

        return sprintf('%s.id IN (SELECT course_role.course_id FROM course_role WHERE course_role.user_id = %s)', $targetTableAlias, $userId);
    }
}
