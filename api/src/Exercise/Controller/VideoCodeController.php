<?php

namespace App\Exercise\Controller;

use App\Entity\Exercise\ExercisePhase;
use App\Entity\Exercise\Material;
use App\Entity\Exercise\VideoCode;
use App\EventStore\DoctrineIntegratedEventStore;
use App\Repository\Exercise\VideoCodeRepository;
use App\Twig\AppRuntime;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class VideoCodeController extends AbstractController
{
    private TranslatorInterface $translator;
    private DoctrineIntegratedEventStore $eventStore;
    private VideoCodeRepository $videoCodeRepository;

    public function __construct(TranslatorInterface $translator, DoctrineIntegratedEventStore $eventStore, VideoCodeRepository $videoCodeRepository)
    {
        $this->translator = $translator;
        $this->eventStore = $eventStore;
        $this->videoCodeRepository = $videoCodeRepository;
    }

    /**
     * @Route("/video-codes/add/{id}", name="exercise-overview__video-codes--add")
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

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($videoCode);
        $entityManager->flush();

        return Response::create('OK');
    }

    /**
     * @Route("/video-codes/delete/{id}", name="exercise-overview__video-codes--delete")
     */
    public function delete(VideoCode $videoCode): Response
    {
        $this->eventStore->addEvent('VideoCodeDeleted', [
            'videoCodeId' => $videoCode->getId(),
            'name' => $videoCode->getName(),
            'color' => $videoCode->getColor(),
        ]);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($videoCode);
        $entityManager->flush();

        $this->addFlash(
            'success',
            $this->translator->trans('videoCode.delete.messages.success', [], 'forms')
        );

        return $this->redirectToRoute('exercise-overview__exercise-phase--edit', ['id' => $videoCode->getExercisePhase()->getBelongsToExercise()->getId(), 'phase_id' => $videoCode->getExercisePhase()->getId()]);
    }

    /**
     * @Route("/video-codes/list/{id}", name="exercise-overview__video-codes--list")
     */
    public function videoCodes(ExercisePhase $exercisePhase): Response
    {
        return $this->render('ExercisePhase/VideoCodesList.html.twig', [
            'videoCodes' => $exercisePhase->getVideoCodes()
        ]);
    }
}
