<?php

namespace App\Exercise\LiveSync;

use Firebase\JWT\JWT;

/**
 * Generates a Publisher JWT secret which is allowed to publish anything.
 *
 * Used by the SERVER; so the secret is only sent out from the PHP server side
 * to the Mercure server side (server2server communication).
 */
class MercureJwtProvider
{
    private string $jwtPrivateSigningKey;

    public function __construct(string $jwtPrivateSigningKey)
    {
        $this->jwtPrivateSigningKey = $jwtPrivateSigningKey;
    }


    public function __invoke(): string
    {
        $payload = LiveSyncService::getBaseJwtPayload();
        $payload['mercure'] = [
            "publish" => ['*']
        ];
        return JWT::encode($payload, $this->jwtPrivateSigningKey);
    }
}
