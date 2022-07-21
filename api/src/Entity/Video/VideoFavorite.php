<?php

namespace App\Entity\Video;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Core\EntityTraits\IdentityTrait;
use App\Entity\Account\User;
use App\Entity\Video\Video;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource
 * @ORM\Entity(repositoryClass="App\Repository\Video\VideoFavoriteRepository")
 */
class VideoFavorite
{
    use IdentityTrait;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Account\User", inversedBy="favoriteVideos")
     * @ORM\JoinColumn(nullable=false)
     */
    private User $user;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Video\Video")
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
