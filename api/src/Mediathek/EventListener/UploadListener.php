<?php


namespace App\Mediathek\EventListener;
use App\VideoEncoding\Message\WebEncodingTask;
use Doctrine\Common\Persistence\ObjectManager;
use Oneup\UploaderBundle\Event\PostPersistEvent;
use Symfony\Component\Messenger\MessageBusInterface;


class UploadListener
{
    private ObjectManager $doctrineObjectManager;

    private MessageBusInterface $messageBus;

    public function __construct(ObjectManager $doctrineObjectManager, MessageBusInterface $messageBus)
    {
        $this->doctrineObjectManager = $doctrineObjectManager;
        $this->messageBus = $messageBus;
    }


    public function onUpload(PostPersistEvent $event)
    {
        //...

        //if everything went fine
        $response = $event->getResponse();

        $this->messageBus->dispatch(new WebEncodingTask($event->getFile()->getPathname()));

        $response['success'] = true;
        return $response;
    }
}
