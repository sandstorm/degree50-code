<?php

namespace App\Exercise\LiveSync;

use App\Entity\Account\User;
use App\Entity\Exercise\ExercisePhaseTeam;
use App\Repository\Exercise\ExercisePhaseTeamRepository;
use Firebase\JWT\JWT;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\Mercure\PublisherInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\RouterInterface;

/**
 * Main service which handles all aspects of the mercure-based live sync.
 *
 * CONSUMERS need to call {@see LiveSyncService::getSubscriberJwtCookie()}.
 *
 * To PUBLISH a message, one needs to call {@see LiveSyncService::publish()}.
 */
class LiveSyncService
{
    private ExercisePhaseTeamRepository $exercisePhaseTeamRepository;
    private string $jwtPrivateSigningKey;
    private RouterInterface $router;
    private PublisherInterface $publisher;

    public function __construct(ExercisePhaseTeamRepository $exercisePhaseTeamRepository, string $jwtPrivateSigningKey, RouterInterface $router, PublisherInterface $publisher)
    {
        $this->exercisePhaseTeamRepository = $exercisePhaseTeamRepository;
        $this->jwtPrivateSigningKey = $jwtPrivateSigningKey;
        $this->router = $router;
        $this->publisher = $publisher;
    }

    public function getSubscriberJwtCookie(User $user): Cookie
    {
        $exercisePhaseTeams = $this->exercisePhaseTeamRepository->findByMember($user);

        $exercisePhaseTeamTopicIdentifiers = [];
        foreach ($exercisePhaseTeams as $exercisePhaseTeam) {
            $exercisePhaseTeamTopicIdentifiers[] = self::buildMercureTopicIdentifier($exercisePhaseTeam);
        }

        $payload = self::getBaseJwtPayload();
        $payload['mercure'] = [
            "subscribe" => $exercisePhaseTeamTopicIdentifiers
        ];

        $jwt = JWT::encode($payload, $this->jwtPrivateSigningKey);

        // TODO: maybe secure:true
        return new Cookie('mercureAuthorization', $jwt, time() + 3600, '/', null, false, true);
    }

    public function getClientSideLiveSyncConfig(ExercisePhaseTeam $exercisePhaseTeam): array
    {
        return [
            'mercureEndpoint' => '/.well-known/mercure',
            'topic' => self::buildMercureTopicIdentifier($exercisePhaseTeam),

            // TODO: maybe this config needs to be moved somewhere else? unsure.
            'exercisePhaseLiveSyncSubmitUrl' => $this->router->generate('app_exercise-phase-livesync', [
                'id' => $exercisePhaseTeam->getExercisePhase()->getId(),
                'team_id' => $exercisePhaseTeam->getId()
            ])
        ];
    }

    private static function buildMercureTopicIdentifier(ExercisePhaseTeam $exercisePhaseTeam)
    {
        return 'exercisePhaseTeam-' . $exercisePhaseTeam->getId();
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
