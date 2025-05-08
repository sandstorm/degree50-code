<?php

namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return static function (ContainerConfigurator $container): void {
    if (getenv('SAML_ENABLED') !== "enabled") {
        // parameter used in rendering the login form
        $container->parameters()->set('saml.enabled', false);
        return;
    }

    $container->parameters()->set('saml.enabled', true);
    $container->import('../conditional_imports/nbgrp_onelogin_saml.yaml');
};
