<?php

namespace App\ExercisePhase\Form;

use App\Domain\Exercise\ExercisePhaseTypes\ReflexionPhase;
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
