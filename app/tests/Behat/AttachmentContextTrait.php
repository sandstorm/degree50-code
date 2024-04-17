<?php

namespace App\Tests\Behat;

use App\Domain\Account\User;
use App\Domain\Exercise\Attachment;
use App\Domain\Exercise\ExercisePhase;

/**
 *
 */
trait AttachmentContextTrait
{

    /**
     * @Given I have an attachment with ID :attachmentId
     */
    public function iHaveAnAttachmentWithId($attachmentId)
    {
        $attachment = new Attachment($attachmentId);
        $fileName = tempnam(sys_get_temp_dir(), 'foo');
        file_put_contents($fileName, 'my file');
        $attachment->setName($fileName);
        $attachment->setMimeType('application/pdf');

        $user = $this->getUserByEmail('foo@bar.de');
        $attachment->setCreator($user);

        $this->entityManager->persist($attachment);
        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }

    /**
     * @Given An Attachment with Id :attachmentId created by User :username exists for ExercisePhase :exercisePhaseId
     */
    public function ensureAttachmentByUserExistsInExercisePhase($attachmentId, $username, $exercisePhaseId)
    {
        $user = $this->getUserByEmail($username);
        /** @var ExercisePhase $exercisePhase */
        $exercisePhase = $this->entityManager->find(ExercisePhase::class, $exercisePhaseId);
        /** @var Attachment $attachment */
        $attachment = $this->entityManager->find(Attachment::class, $attachmentId);

        if (!$attachment) {
            $attachment = new Attachment($attachmentId);
            $fileName = tempnam(sys_get_temp_dir(), 'foo');
            file_put_contents($fileName, 'my file');
            $attachment->setName('TEST_ATTACHMENT_' . $attachmentId);
            $attachment->setMimeType('application/pdf');
        }

        $attachment->setCreator($user);
        $exercisePhase->addAttachment($attachment);

        $this->entityManager->persist($exercisePhase);
        $this->entityManager->persist($attachment);

        $this->eventStore->disableEventPublishingForNextFlush();
        $this->entityManager->flush();
    }
}
