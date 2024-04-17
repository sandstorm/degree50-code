<?php

namespace App\VideoCode\Controller;

use App\Domain\Exercise\ExercisePhase;
use App\Domain\Exercise\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @IsGranted("ROLE_USER")
 * @isGranted("user-verified")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class VideoCodeController extends AbstractController
{

    public function __construct(
        private readonly EntityManagerInterface       $entityManager,
        private readonly DoctrineIntegratedEventStore $eventStore
    )
    {
    }

    /**
     * Used only asynchronous
     *
     * @Route("/video-codes/add/{id}", name="video-code__add", methods={"POST"})
     */
    public function add(Request $request, ExercisePhase $exercisePhase): Response
    {
        $color = json_decode($request->getContent(), true)['color'];
        $name = json_decode($request->getContent(), true)['name'];
        $videoCode = new VideoCode();
        $videoCode->setName($name);
        $videoCode->setColor($color);
        $videoCode->setExercisePhase($exercisePhase);

        $this->eventStore->addEvent('VideoCodeCreated', [
            'videoCodeId' => $videoCode->getId(),
            'name' => $videoCode->getName(),
            'color' => $videoCode->getColor(),
        ]);

        $this->entityManager->persist($videoCode);
        $this->entityManager->flush();

        return new Response('OK');
    }

    /**
     * Used only asynchronous
     *
     * @Route("/video-codes/delete/{id}", name="video-code__delete", methods={"GET"})
     */
    public function delete(VideoCode $videoCode): Response
    {
        $this->eventStore->addEvent('VideoCodeDeleted', [
            'videoCodeId' => $videoCode->getId(),
            'name' => $videoCode->getName(),
            'color' => $videoCode->getColor(),
        ]);

        $this->entityManager->remove($videoCode);
        $this->entityManager->flush();

        return new Response('OK');
    }

    /**
     * @Route("/video-codes/list/{id}", name="video-code__list")
     */
    public function videoCodes(ExercisePhase $exercisePhase): Response
    {
        return $this->render('ExercisePhase/VideoCodesList.html.twig', [
            'videoCodes' => $exercisePhase->getVideoCodes()
        ]);
    }
}
