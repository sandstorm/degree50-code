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
            ->excludingClassesThat(Selector::haveClassName(\App\Entity\Exercise\ExercisePhaseTypes\VideoAnalysis::class))
            ->mustInclude()
            ->classesThat(Selector::haveClassName(App\Core\EntityTraits\IdentityTrait::class))
            ->build();
    }
}
