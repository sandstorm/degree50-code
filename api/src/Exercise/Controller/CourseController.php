<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\CourseMembersType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 */
class CourseController extends AbstractController
{
    private DoctrineIntegratedEventStore $eventStore;

    /**
     * CourseController constructor.
     * @param DoctrineIntegratedEventStore $eventStore
     */
    public function __construct(DoctrineIntegratedEventStore $eventStore)
    {
        $this->eventStore = $eventStore;
    }

    /**
     * @IsGranted("edit", subject="course")
     * @Route("/exercise-overview/{id}/course-members", name="exercise-overview__course--members")
     */
    public function members(Request $request, Course $course): Response
    {
        $form = $this->createForm(CourseMembersType::class, $course);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $newMembers = $form->get('users')->getData();

            /* @var User $newMember */
            foreach ($newMembers as $newMember) {
                $courseRole = new CourseRole();
                $courseRole->setName(CourseRole::STUDENT);
                $courseRole->setUser($newMember);
                $course->addCourseRole($courseRole);
            }

            $this->eventStore->addEvent('CourseRolesAdded', [
                'courseId' => $course->getId(),
                'courseRoles' => $course->getCourseRoles()->map(fn(CourseRole $courseRole) => [
                    'courseRoleId' => $courseRole->getId(),
                    'userName' => $courseRole->getUser()->getUsername()
                ])->toArray(),
            ]);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($course);
            $entityManager->flush();

            // redirect to clear form
            return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
        }

        return $this->render('Course/Members.html.twig', [
            'course' => $course,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("edit", subject="course")
     * @Route("/exercise-overview/{id}/course-members/{userRole_id}/remove", name="exercise-overview__course--remove-role")
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    public function delete(Course $course, CourseRole $courseRole): Response
    {
        $this->eventStore->addEvent('CourseRoleRemoved', [
            'courseRoleId' => $courseRole->getId(),
            'courseId' => $course->getId(),
            'userName' => $courseRole->getUser()->getUsername(),
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($courseRole);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
    }
}
