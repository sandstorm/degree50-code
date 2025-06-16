<?php

namespace App\Domain\Course\Service;

use App\Domain\Course\Model\Course;
use App\Domain\Course\Repository\CourseRepository;
use App\Domain\User\Model\User;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Common\Collections\Order;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

readonly class CourseExpirationService
{
    public function __construct(
        private CourseRepository    $courseRepository,
        private MailerInterface     $mailer,
        private TranslatorInterface $translator,
        private LoggerInterface     $logger, private EntityManagerInterface $entityManager,
    )
    {
    }

    /**
     * @return Collection<Course>
     */
    public function getSoonExpiringCourses(): Collection
    {
        $criteria = Criteria::create()
            ->where(Criteria::expr()->lte('expirationDate', new \DateTime('+2 month')))
            // send notifications only once until expiration date is modified (see CourseController->createOrUpdateCourse())
            ->andWhere(Criteria::expr()->eq('expirationNotificationSent', 'false'))
            // Tutorial courses do not expire
            ->andWhere(Criteria::expr()->eq('isTutorialCourse', 'false'));

        return $this->courseRepository->findAllBy($criteria);
    }

    /**
     * @return Collection<Course>
     */
    public function getExpiredCourses(): Collection
    {
        $criteria = Criteria::create()
            ->where(Criteria::expr()->lt('expirationDate', new \DateTime()));

        return $this->courseRepository->findAllBy($criteria);
    }

    /**
     * Sends notifications to dozenten for courses that are about to expire.
     *
     * @param Collection<Course> $soonExpiringCourses
     */
    public function sendNotificationsForSoonExpiringCourses(Collection $soonExpiringCourses): void
    {
        /** @var array<string, array<Course>> $dozentEmailCourseMap */
        $dozentEmailCourseMap = [];

        foreach ($soonExpiringCourses as $course) {
            $dozenten = $course->getDozents();

            // TODO: should we send an email to the creator if there is no dozent?

            foreach ($dozenten as $dozent) {
                /* @var User $dozent */
                $dozentEmailCourseMap[$dozent->getEmail()][] = $course;
            }
        }

        foreach ($dozentEmailCourseMap as $email => $courses) {
            $emailSent = $this->sendExpirationNotice($email, $courses);

            if ($emailSent) {
                foreach ($courses as $course) {
                    $course->setExpirationNotificationSent(true);
                    $this->entityManager->persist($course);
                }
            }

            $this->entityManager->flush();
        }
    }

    private function sendExpirationNotice(string $email, array $courses): bool
    {
        $email = (new TemplatedEmail())
            ->to($email)
            ->subject($this->translator->trans('email.subject', [], 'CourseExpiration'))
            ->htmlTemplate('CourseExpiration/notification_email.html.twig')
            ->context([
                'courses' => $courses,
            ]);

        try {
            $this->mailer->send($email);
            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Failed to send course expiration notice for course to email', [
                'email' => $email,
                'courses' => $courses,
                'exception' => $e,
            ]);
        }

        return false;
    }
}
