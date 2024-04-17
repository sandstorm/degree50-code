<?php

namespace App\DependencyInjection\Compiler;

use App\Core\FileSystemService;
use Oneup\FlysystemBundle\DependencyInjection\Compiler\FilesystemPass;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Initializes
 *
 * Modelled after {@see FilesystemPass}
 */
class FileSystemCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        if (!$container->has(FileSystemService::class)) {
            return;
        }

        $fileSystemServiceDefinition = $container->findDefinition(FileSystemService::class);

        // find all service IDs with the app.mail_transport tag
        $taggedServices = $container->findTaggedServiceIds('oneup_flysystem.filesystem');

        foreach ($taggedServices as $id => $attributes) {
            foreach ($attributes as $attribute) {
                if (!isset($attribute['mount'])) {
                    continue;
                }

                $fileSystemServiceDefinition->addMethodCall('registerFilesystem', [
                    new Reference($id),
                    $attribute['mount']
                ]);
            }
        }
    }
}
