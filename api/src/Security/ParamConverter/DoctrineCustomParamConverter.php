<?php

namespace App\Security\ParamConverter;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter\DoctrineParamConverter;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DoctrineCustomParamConverter extends DoctrineParamConverter
{


    /**
     * @var EntityManagerInterface
     */
    private $entityManager;

    public function __construct(ManagerRegistry $registry = null, ExpressionLanguage $expressionLanguage = null, array $options = [], EntityManagerInterface $entityManager = null)
    {
        parent::__construct($registry, $expressionLanguage, $options);
        $this->entityManager = $entityManager;
    }

    public function apply(Request $request, ParamConverter $configuration)
    {
        try {
            return parent::apply($request, $configuration);
        } catch (NotFoundHttpException $e) {
            $this->entityManager->getFilters()->disable('exercise_doctrine_filter');
            $this->entityManager->getFilters()->disable('course_doctrine_filter');
            $this->entityManager->getFilters()->disable('video_doctrine_filter');

            // if a NotFoundHttpException is triggered, this is re-thrown.
            parent::apply($request, $configuration);
        }
    }
}
