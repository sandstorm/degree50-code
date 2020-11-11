<?php


namespace App\Security\DoctrineFilter;


use App\Entity\Video\Video;
use Doctrine\ORM\Mapping\ClassMetadata;

/**
 *
 * FILTER PARAMETERS:
 *
 * - userId: the User ID of the user.
 *
 */
class VideoDoctrineFilter extends AbstractDoctrineFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias)
    {
        if ($targetEntity->getName() !== Video::class) {
            return '';
        }
        $userId = $this->getParameter('userId');
        // we disable the filter if the current user is an ADMIN
        if (parent::userIsAdmin()) {
            return '';
        }
        // users can only see videos that are assigned to the course they have access to
        return sprintf('%s.id IN (
            SELECT video_course.video_id 
            FROM video_course 
            WHERE video_course.course_id IN (
                SELECT course_role.course_id
                FROM course_role
                WHERE course_role.user_id = %s
            )
        )', $targetTableAlias, $userId);
    }
}
