<?php

use PhpAT\Rule\Rule;
use PhpAT\Selector\Selector;
use PhpAT\Test\ArchitectureTest;

class EntityTest extends ArchitectureTest
{
    public function testDomainDoesNotDependOnOtherLayers(): Rule
    {
        return $this->newRule
            ->classesThat(Selector::haveClassName('App\Entity\*'))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\VirtualizedFile::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhaseTypes\ReflexionPhase::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionData\ServerSideSolutionData::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionData\ServerSideVideoCode::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionData\ServerSideVideoCodePrototype::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionData\ServerSideAnnotation::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionData\ServerSideCut::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhase\ExercisePhaseType::class))
            ->mustInclude()
            ->classesThat(Selector::haveClassName(App\Core\EntityTraits\IdentityTrait::class))
            ->build();
    }
}
