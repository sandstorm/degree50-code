<?php

namespace App\Domain\Course\Controller;

use App\Domain\Course\Form\CourseFormType;
use App\Domain\Course\Form\CourseMembersType;
use App\Domain\Course\Model\Course;
use App\Domain\CourseRole\Model\CourseRole;
use App\Domain\User\Model\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;

#[IsGranted("ROLE_USER")]
#[isGranted("user-verified")]
#[IsGranted("data-privacy-accepted")]
#[IsGranted("terms-of-use-accepted")]
class CourseController extends AbstractController
{
    public function __construct(
        private readonly TranslatorInterface    $translator,
        private readonly EntityManagerInterface $entityManager
    )
    {
    }

    #[Route("/exercise-overview/{id}/course-members", name: "exercise-overview__course--members")]
    #[IsGranted("editMembers", subject: "course")]
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

            $this->entityManager->persist($course);
            $this->entityManager->flush();

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
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    #[Route("/exercise-overview/{id}/course-members/{userRole_id}/remove", name: "exercise-overview__course--remove-role")]
    public function removeCourseMember(Request $request, Course $course, CourseRole $courseRole): Response
    {
        $redirectToEdit = (bool)$request->get('redirectToEdit');

        $courseRolesWithDozent = $course->getCourseRoles()->filter(fn(CourseRole $courseRole) => $courseRole->isCourseDozent());
        if ($redirectToEdit && count($courseRolesWithDozent) == 1) {
            $this->addFlash(
                'danger',
                $this->translator->trans('course.removeMember.messages.notPossible', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview__course--edit', ['id' => $course->getId()]);
        }

        $this->entityManager->remove($courseRole);
        $this->entityManager->flush();

        if ($redirectToEdit) {
            return $this->redirectToRoute('exercise-overview__course--edit', ['id' => $course->getId()]);
        } else {
            return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
        }
    }

    /**
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    #[IsGranted("editMembers", subject: "course")]
    #[Route("/exercise-overview/{id}/course-members/{userRole_id}/upgrade", name: "exercise-overview__course--upgrade-role")]
    public function upgradeCourseMember(Course $course, CourseRole $courseRole): Response
    {
        $courseRole->setName(CourseRole::DOZENT);

        $this->entityManager->persist($courseRole);
        $this->entityManager->flush();

        return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
    }

    /**
     * @Entity("courseRole", expr="repository.find(userRole_id)")
     */
    #[IsGranted("editMembers", subject: "course")]
    #[Route("/exercise-overview/{id}/course-members/{userRole_id}/downgrade", name: "exercise-overview__course--downgrade-role")]
    public function downgradeCourseMember(Course $course, CourseRole $courseRole): Response
    {
        $courseRole->setName(CourseRole::STUDENT);

        $this->entityManager->persist($courseRole);
        $this->entityManager->flush();

        return $this->redirectToRoute('exercise-overview__course--members', ['id' => $course->getId()]);
    }

    /**
     * @Security("is_granted('ROLE_DOZENT') or is_granted('ROLE_ADMIN')")
     */
    #[Route("/exercise-overview/course/new", name: "exercise-overview__course--new")]
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

    #[IsGranted("edit", subject: "course")]
    #[Route("/exercise-overview/course/edit/{id}", name: "exercise-overview__course--edit")]
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

    #[IsGranted("delete", subject: "course")]
    #[Route("/exercise-overview/course/delete/{id}", name: "exercise-overview__course--delete")]
    public function delete(Course $course): Response
    {
        if (count($course->getExercises()) > 0) {
            $this->addFlash(
                'danger',
                $this->translator->trans('course.delete.messages.notPossible', [], 'forms')
            );

            return $this->redirectToRoute('exercise-overview', ['id' => $course->getId()]);
        }

        $this->entityManager->remove($course);
        $this->entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('course.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview');
    }

    private function createOrUpdateCourse(FormInterface $form): void
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

        $this->entityManager->persist($course);
        $this->entityManager->flush();
    }
}
