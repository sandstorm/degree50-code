<?php

namespace App\Exercise\LiveSync;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use Firebase\JWT\JWT;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\Mercure\PublisherInterface;
use Symfony\Component\Mercure\Update;

/**
 * Main service which handles all aspects of the mercure-based live sync.
 *
 * CONSUMERS need to call {@see LiveSyncService::getSubscriberJwtCookie()}.
 *
 * To PUBLISH a message, one needs to call {@see LiveSyncService::publish()}.
 */
class LiveSyncService
{
    private string $jwtPrivateSigningKey;
    private PublisherInterface $publisher;

    public function __construct(string $jwtPrivateSigningKey, PublisherInterface $publisher)
    {
        $this->jwtPrivateSigningKey = $jwtPrivateSigningKey;
        $this->publisher = $publisher;
    }

    public function getSubscriberJwtCookie(User $user, ExercisePhaseTeam $exercisePhaseTeam): Cookie
    {
        $exercisePhaseTeamTopicIdentifiers = [];
        $exercisePhaseTeamTopicIdentifiers[] = self::buildMercureTopicIdentifier($exercisePhaseTeam);
        // we also need to enable access to the subscription topic
        $exercisePhaseTeamTopicIdentifiers[] = self::buildPresenceTopicIdentifier($exercisePhaseTeam);
        // we also need to enable access to the subscription API
        $exercisePhaseTeamTopicIdentifiers[] = self::buildSubscriptionAPIEndpoint($exercisePhaseTeam);

        $payload = self::getBaseJwtPayload();
        $payload['mercure'] = [
            "subscribe" => $exercisePhaseTeamTopicIdentifiers,
            "payload" => [
                "user" => [
                    "id" => $user->getId(),
                    "name" => $user->getUsername()
                ]
            ]
        ];

        $jwt = JWT::encode($payload, $this->jwtPrivateSigningKey);

        // TODO: maybe secure:true
        return new Cookie('mercureAuthorization', $jwt, time() + 3600, '/', null, false, true);
    }

    public function getClientSideLiveSyncConfig(ExercisePhaseTeam $exercisePhaseTeam): array
    {
        return [
            'topics' => [
                'solution' => self::buildMercureTopicIdentifier($exercisePhaseTeam),
                'presence' => self::buildPresenceTopicIdentifier($exercisePhaseTeam)
            ],
            'mercureEndpoint' => '/.well-known/mercure',
            'subscriptionsEndpoint' => self::buildSubscriptionAPIEndpoint($exercisePhaseTeam),
            'teamMembers' => array_map(function (User $member) {
                return [
                    'id' => $member->getId(),
                    'name' => $member->getUsername(),
                    'connectionState' => 'UNKNOWN'
                ];
            }, $exercisePhaseTeam->getMembers()->toArray())
        ];
    }

    private static function buildMercureTopicIdentifier(ExercisePhaseTeam $exercisePhaseTeam): string
    {
        return 'exercisePhaseTeam-' . $exercisePhaseTeam->getId();
    }

    private static function buildPresenceTopicIdentifier(ExercisePhaseTeam $exercisePhaseTeam): string
    {
        return '/.well-known/mercure/subscriptions/' . self::buildMercureTopicIdentifier($exercisePhaseTeam) . '/{subscription}';
    }

    private static function buildSubscriptionAPIEndpoint(ExercisePhaseTeam $exercisePhaseTeam): string
    {
        return '/.well-known/mercure/subscriptions/' . self::buildMercureTopicIdentifier($exercisePhaseTeam);
    }

    public static function getBaseJwtPayload(): array
    {
        return [
            "iss" => "Degree 4.0 App",
            "iat" => time(), // issued at
            "nbf" => time() - 5 * 60, // not before,
            "exp" => time() + 30 * 60, // expiration in 30 minutes,
        ];
    }

    public function publish(ExercisePhaseTeam $exercisePhaseTeam, array $data)
    {
        $update = new Update(
            self::buildMercureTopicIdentifier($exercisePhaseTeam),
            json_encode($data),
            true
        );
        $this->publisher->__invoke($update);
    }
}
