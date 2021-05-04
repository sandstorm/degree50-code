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
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExerciseInterface::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\VirtualizedFile::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysisPhase::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhaseTypes\VideoCutPhase::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionLists\ServerSideSolutionLists::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCode::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionLists\ServerSideVideoCodePrototype::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionLists\ServerSideAnnotation::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ServerSideSolutionLists\ServerSideCut::class))
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Account\userService::class))
            ->mustInclude()
            ->classesThat(Selector::haveClassName(App\Core\EntityTraits\IdentityTrait::class))
            ->build();
    }
}
