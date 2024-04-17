<?php

namespace App\Domain;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Domain\VideoFavorite\Repository\VideoFavoritesRepository")
 */
class VideoFavorite
{
    use IdentityTrait;

    /**
     * @ORM\ManyToOne(targetEntity="App\Domain\User", inversedBy="favoriteVideos")
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
