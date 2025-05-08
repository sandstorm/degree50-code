<?php

namespace Symfony\Component\DependencyInjection\Loader\Configurator;

return static function (ContainerConfigurator $container): void {
    $container->import('../conditional_imports/security.yaml');

    if (getenv('SAML_ENABLED') !== "enabled") {
        return;
    }

    // this config was part of security.yaml before, but moved here to be able to enable/disable saml via env
    $container->extension('security', [
        'firewalls' => [
            'main' => [
                // we allow logging in both via SAML (Single Sign On) and via form_login.
                'saml' => [
                    'identifier_attribute' => 'mail',
                    'check_path' => 'saml_acs',
                    'login_path' => 'saml_login',
                    'failure_path' => 'app_login',
                    'always_use_default_target_path' => true,
                    'user_factory' => 'saml_user_factory',
                    'persist_user' => true,
                ],
            ],
        ],
    ]);
};
