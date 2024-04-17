<?php

namespace App\Exercise\Form;

use App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase;
use Symfony\Component\OptionsResolver\OptionsResolver;


class ReflexionPhaseFormType extends ExercisePhaseFormType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ReflexionPhase::class,
        ]);
    }
}
