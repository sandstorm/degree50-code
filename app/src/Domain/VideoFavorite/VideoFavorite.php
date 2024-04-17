<?php

namespace App\Domain\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Domain\Account\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoFavoritesRepository")
 */
class VideoFavorite
{
    use IdentityTrait;

    /**
     * @ORM\ManyToOne(targetEntity="App\Domain\Account\User", inversedBy="favoriteVideos")
     * @ORM\JoinColumn(nullable=false)
     */
    private User $user;

    /**
     * @ORM\ManyToOne(targetEntity="App\Domain\Video\Video")
     * @ORM\JoinColumn(nullable=false)
     */
    private Video $video;

    /**
     * Video constructor.
     */
    public function __construct(User $user, Video $video, string $id = null)
    {
        $this->generateOrSetId($id);
        $this->user = $user;
        $this->video = $video;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function getVideo()
    {
        return $this->video;
    }
}
