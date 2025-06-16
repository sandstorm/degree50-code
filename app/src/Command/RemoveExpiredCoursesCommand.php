<?php

namespace App\Command;

use App\Domain\Course\Model\Course;
use App\Domain\Course\Service\CourseExpirationService;
use App\Domain\Course\Service\CourseService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class RemoveExpiredCoursesCommand extends Command
{
    protected static $defaultName = 'app:remove-expired-courses';

    public function __construct(
        private readonly CourseExpirationService $courseExpirationService, private readonly CourseService $courseService,
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title(
            'Send notifications for courses that will expire soon | Remove expired courses'
        );

        $io->writeln('Sending notifications for courses that will expire soon..');
        $soonExpiringCourses = $this->courseExpirationService->getSoonExpiringCourses();

        if ($soonExpiringCourses->isEmpty()) {
            $io->success('No soon expiring courses found');
        } else {
            $io->listing($soonExpiringCourses
                ->map(
                    function (Course $course) {
                        return sprintf(
                            '%s (%s) - Expiration Date: %s',
                            $course->getName(),
                            $course->getId(),
                            $course->getExpirationDate()->format('Y-m-d')
                        );
                    }
                )
                ->toArray()
            );

            $this->courseExpirationService->sendNotificationsForSoonExpiringCourses($soonExpiringCourses);

            $io->success('done');
        }

        $io->writeln('Removing expired courses..');
        $expiredCourses = $this->courseExpirationService->getExpiredCourses();

        if ($expiredCourses->isEmpty()) {
            $io->success('No expired courses found');
        } else {
            $io->writeln('Removing expired courses:');
            $io->listing($expiredCourses
                ->map(
                    function (Course $course) {
                        return sprintf(
                            '%s (%s) - Expiration Date: %s',
                            $course->getName(),
                            $course->getId(),
                            $course->getExpirationDate()->format('Y-m-d')
                        );
                    }
                )
                ->toArray()
            );

            foreach ($expiredCourses as $course) {
                $io->writeln(sprintf('[DRY RUN!] Removing course: %s (%s)', $course->getName(), $course->getId()));
                // TODO: We activate this later so users have time to react
                // $this->courseService->removeCourse($course);
            }

            $io->success('done');
        }

        return 0;
    }
}
