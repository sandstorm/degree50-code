<?php

use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

return static function (RoutingConfigurator $routingConfigurator): void {
    if (getenv('SAML_ENABLED') === "enabled") {
        $routingConfigurator->import("@NbgrpOneloginSamlBundle/Resources/config/routes.php");
    }
};
