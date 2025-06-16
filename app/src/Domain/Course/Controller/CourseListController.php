<?php

namespace App\Domain\Course\Controller;

use App\Domain\Course\Model\Course;
use App\Domain\Course\Model\CourseListDTO;
use App\Domain\Course\Repository\CourseRepository;
use App\Domain\Exercise\Model\Exercise;
use App\Domain\Exercise\Model\ExerciseStatus;
use App\Domain\Exercise\Service\ExerciseService;
use App\Domain\User\Model\User;
use App\Security\Voter\DataPrivacyVoter;
use App\Security\Voter\TermsOfUseVoter;
use App\Security\Voter\UserVerifiedVoter;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Common\Collections\Order;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authorization\Voter\AuthenticatedVoter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted(AuthenticatedVoter::IS_AUTHENTICATED_FULLY)]
#[IsGranted(UserVerifiedVoter::USER_VERIFIED)]
#[IsGranted(DataPrivacyVoter::ACCEPTED)]
#[IsGranted(TermsOfUseVoter::ACCEPTED)]
class CourseListController extends AbstractController
{
    public function __construct(
        private readonly CourseRepository $courseRepository,
        private readonly ExerciseService  $exerciseService,
    )
    {
    }

    #[Route("/courses", name: "courses")]
    public function index(
        #[MapQueryParameter(name: 'orderBy', filter: \FILTER_VALIDATE_REGEXP, options: ['regexp' => '/^(name|creationDate|lastModified|fachbereich)$/'])] string $orderByParam = 'lastModified',
        #[MapQueryParameter(name: 'order', filter: \FILTER_VALIDATE_REGEXP, options: ['regexp' => '/^(asc|desc)$/'])] string                                     $orderDirectionParam = 'desc',
    ): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $orderParsed = match ($orderDirectionParam) {
            'asc' => Order::Ascending,
            'desc' => Order::Descending,
        };

        $criteria = match ($orderByParam) {
            'name' => Criteria::create()->orderBy(['name' => $orderParsed]),
            'creationDate' => Criteria::create()->orderBy(['creationDate' => $orderParsed, 'name' => 'asc']),
            // We always order by name asc and then creation date if not specified otherwise.
            default => Criteria::create()->orderBy(['name' => 'asc', 'creationDate' => 'desc']),
            // The other two options can not be done via Criteria, so we handle them separately
        };

        // Fetch courses for the user and order them
        $courses = $this->courseRepository->findAllForUserWithCriteria($user, $criteria);

        // If ordered by fachbereich, we sort the courses by fachbereich name
        // WHY like this? Because the fachbereich is not a direct field in the Course entity and I could not
        // find a way to order by it directly in the repository query (e.g. by Criteria).
        if ($orderByParam === 'fachbereich') {
            usort($courses, function (Course $a, Course $b) use ($orderParsed) {
                if ($orderParsed === Order::Ascending) {
                    return strcmp($a->getFachbereich()?->getName() ?? '', $b->getFachbereich()?->getName() ?? '');
                }

                return -1 * strcmp($a->getFachbereich()?->getName() ?? '', $b->getFachbereich()?->getName() ?? '');
            });
        }

        // If ordered by lastModified, we sort the courses by the last edited date of exercises
        if ($orderByParam === 'lastModified') {
            usort($courses, function (Course $a, Course $b) use ($user, $orderParsed) {
                $lastEditedA = $this->getLastModifiedDateByUser($a, $user);
                $lastEditedB = $this->getLastModifiedDateByUser($b, $user);

                return $orderParsed === Order::Ascending ? $lastEditedA <=> $lastEditedB : -1 * ($lastEditedA <=> $lastEditedB);
            });
        }

        $courseDTOs = [];
        $tutorialCourseDTOs = [];

        foreach ($courses as $course) {
            if ($course->isTutorialCourse()) {
               $tutorialCourseDTOs[] = new CourseListDTO(
                    course: $course,
                    completedExercisesCount: $this->getCompletedExercisesForUser($course, $user)->count(),
                    totalExercisesCount: $this->getVisibleExercisesForUser($course, $user)->count(),
                    lastModifiedDate: $this->getLastModifiedDateByUser($course, $user),
                );
            } else {
                $courseDTOs[] = new CourseListDTO(
                    course: $course,
                    completedExercisesCount: $this->getCompletedExercisesForUser($course, $user)->count(),
                    totalExercisesCount: $this->getVisibleExercisesForUser($course, $user)->count(),
                    lastModifiedDate: $this->getLastModifiedDateByUser($course, $user),
                );
            }
        }

        return $this->render('Course/List.html.twig', [
            'courseListDTOs' => $courseDTOs,
            'tutorialCourseListDTOs' => $tutorialCourseDTOs,
            'orderBy' => $orderByParam,
            'order' => $orderDirectionParam,
        ]);
    }

    /**
     * @return Collection<Exercise>
     */
    private function getCompletedExercisesForUser(Course $course, User $user): Collection
    {
        // Assuming the Course entity has a method to get exercises and each exercise has a method to check if it's completed
        return $this->getVisibleExercisesForUser($course, $user)
            ->filter(fn(Exercise $exercise) => $this->exerciseService->getExerciseStatusForUser($exercise, $user) === ExerciseStatus::BEENDET);
    }

    /**
     * @return Collection<Exercise>
     */
    private function getVisibleExercisesForUser(Course $course, User $user): Collection
    {
        return $course->getExercises()
            ->filter(fn(Exercise $exercise) => $this->exerciseService->isExerciseVisibleForUser($exercise, $user));
    }

    private function getLastModifiedDateByUser(Course $course, User $user): ?\DateTimeImmutable
    {
        return max($course->getExercises()
            ->map(fn(Exercise $exercise) => $this->exerciseService->getLastEditDateByUser($exercise, $user))
            ->toArray() ?: [null]
        );
    }
}
