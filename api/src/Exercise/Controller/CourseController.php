<?php

namespace App\Exercise\Controller;

use App\Entity\Account\Course;
use App\Entity\Account\CourseRole;
use App\Entity\Account\User;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Exercise\Form\CourseMembersType;
use App\Exercise\Form\CourseFormType;
use Doctrine\Common\Collections\ArrayCollection;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class CourseController extends AbstractController
{
    private DoctrineIntegratedEventStore $eventStore;
    private TranslatorInterface $translator;

    /**
     * CourseController constructor.
     * @param DoctrineIntegratedEventStore $eventStore
     * @param TranslatorInterface $translator
     */
    public function __construct(DoctrineIntegratedEventStore $eventStore, TranslatorInterface $translator)
    {
        $this->eventStore = $eventStore;
        $this->translator = $translator;
    }

    /**
     * @IsGranted("editMembers", subject="course")
     * @Route("/exercise-overview/{id}/course-members", name="exercise-overview__course--members")
     */
    public function editCourseMembers(Request $request, Course $course): Response
    {
        $form = $this->createForm(CourseMembersType::class, $course);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $newMembers = $form->get('users')->getData();

            /** @var User $newMember */
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

            $this->addFlash(
                'success',
                $this->translator->trans('course.editMembers.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
        }

        $studentsArray = $course->getCourseRoles()
            ->filter(function (CourseRole $role) {
                if ($role->getUser()->isAdmin()) {
                    return false;
                }
                return $role->getUser()->isStudent();
            })
            ->toArray();

        // MUTATION! Sort by userName
        usort($studentsArray, function (CourseRole $a, CourseRole $b) {
            return ($a->getUser()->getUsername() > $b->getUser()->getUsername()) ? -1 : 1;
        });

        $students = new ArrayCollection($studentsArray);

        return $this->render('Course/Members.html.twig', [
            'course' => $course,
            'students' => $students,
            'form' => $form->createView()
        ]);
    }

    /**
     * @Security("is_granted('edit', course) or is_granted('editMembers', course)")
     * @Route("/exercise-overview/{id}/course-members/{userRole_id}/remove", name="exercise-overview__course--remove-role")
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    public function removeCourseMember(Request $request, Course $course, CourseRole $courseRole): Response
    {
        $redirectToEdit = !!$request->get('redirectToEdit');

        $this->eventStore->addEvent('CourseRoleRemoved', [
            'courseRoleId' => $courseRole->getId(),
            'courseId' => $course->getId(),
            'userName' => $courseRole->getUser()->getUsername(),
        ]);

        $courseRolesWithDozent = $course->getCourseRoles()->filter(fn(CourseRole $courseRole) => $courseRole->isCourseDozent());
        if ($redirectToEdit && count($courseRolesWithDozent) == 1) {
            $this->addFlash(
                'danger',
                $this->translator->trans('course.removeMember.messages.notPossible', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview__course--edit', ['id' => $course->getId()]);
        }

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($courseRole);
        $entityManager->flush();

        if ($redirectToEdit) {
            return $this->redirectToRoute('exercise-overview__course--edit', ['id' => $course->getId()]);
        } else {
            return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
        }
    }

    /**
     * @IsGranted("editMembers", subject="course")
     * @Route("/exercise-overview/{id}/course-members/{userRole_id}/upgrade", name="exercise-overview__course--upgrade-role")
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    public function upgradeCourseMember(Request $request, Course $course, CourseRole $courseRole): Response
    {
        $this->eventStore->addEvent('CourseRoleUpgraded', [
            'courseRoleId' => $courseRole->getId(),
            'courseId' => $course->getId(),
            'userName' => $courseRole->getUser()->getUsername(),
        ]);

        $courseRole->setName(CourseRole::DOZENT);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($courseRole);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
    }

    /**
     * @IsGranted("editMembers", subject="course")
     * @Route("/exercise-overview/{id}/course-members/{userRole_id}/downgrade", name="exercise-overview__course--downgrade-role")
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    public function downgradeCourseMember(Request $request, Course $course, CourseRole $courseRole): Response
    {
        $this->eventStore->addEvent('CourseRoleDowngraded', [
            'courseRoleId' => $courseRole->getId(),
            'courseId' => $course->getId(),
            'userName' => $courseRole->getUser()->getUsername(),
        ]);

        $courseRole->setName(CourseRole::STUDENT);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($courseRole);
        $entityManager->flush();

        return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
    }

    /**
     * @Security("is_granted('ROLE_DOZENT') or is_granted('ROLE_ADMIN')")
     * @Route("/exercise-overview/course/new", name="exercise-overview__course--new")
     */
    public function new(Request $request): Response
    {
        $course = new Course();

        $form = $this->createForm(CourseFormType::class, $course);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->createOrUpdateCourse($form);

            $this->addFlash(
                'success',
                $this->translator->trans('course.new.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview', ['id' => $course->getId()]);
        }

        return $this->render('Course/New.html.twig', [
            'course' => $course,
            'form' => $form->createView()
        ]);
    }

    private function createOrUpdateCourse(FormInterface $form)
    {
        // $form->getData() holds the submitted values
        // but, the original `$course` variable has also been updated
        $course = $form->getData();

        $newMembers = $form->get('users')->getData();

        /** @var User $newMember */
        foreach ($newMembers as $newMember) {
            $courseRole = new CourseRole();
            $courseRole->setName(CourseRole::DOZENT);
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

        $this->eventStore->addEvent('CourseCreated', [
            'courseId' => $course->getId(),
            'name' => $course->getName(),
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($course);
        $entityManager->flush();
    }

    /**
     * @IsGranted("edit", subject="course")
     * @Route("/exercise-overview/course/edit/{id}", name="exercise-overview__course--edit")
     */
    public function edit(Request $request, Course $course): Response
    {
        $form = $this->createForm(CourseFormType::class, $course);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->createOrUpdateCourse($form);

            $this->addFlash(
                'success',
                $this->translator->trans('course.edit.messages.success', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview__course--edit', ['id' => $course->getId()]);
        }

        $tutorsArray = $course->getCourseRoles()
            ->filter(function (CourseRole $role) {
                return $role->getUser()->isDozent();
            })
            ->toArray();

        // MUTATION! Sort by userName
        usort($tutorsArray, function (CourseRole $a, CourseRole $b) {
            return ($a->getUser()->getUsername() > $b->getUser()->getUsername()) ? -1 : 1;
        });

        $tutors = new ArrayCollection($tutorsArray);

        return $this->render('Course/Edit.html.twig', [
            'course' => $course,
            'tutors' => $tutors,
            'form' => $form->createView()
        ]);
    }

    /**
     * @IsGranted("delete", subject="course")
     * @Route("/exercise-overview/course/delete/{id}", name="exercise-overview__course--delete")
     */
    public function delete(Course $course): Response
    {
        if (count($course->getExercises()) > 0) {
            $this->addFlash(
                'danger',
                $this->translator->trans('course.delete.messages.notPossible', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview', ['id' => $course->getId()]);
        }

        $this->eventStore->addEvent('CourseDeleted', [
            'courseId' => $course->getId(),
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($course);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('course.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview');
    }
}
