<?php


namespace App\VideoEncoding\MessageHandler;


use App\VideoEncoding\Message\WebEncodingTask;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class WebEncodingHandler implements MessageHandlerInterface
{
    public function __invoke(WebEncodingTask $encodingTask)
    {
    }
}
