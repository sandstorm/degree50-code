import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { useCallback } from 'react'
import { useToggleVideoFavoriteMutation } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'

type Props = {
  video: Video
}

const VideoTile = (props: Props) => {
  const { video } = props
  const [sendToggleRequest] = useToggleVideoFavoriteMutation()

  const unfavorVideo = useCallback(() => {
    sendToggleRequest(video.id)
  }, [video, sendToggleRequest])

  // NOTE: This is basically a copy of a tile from Video.html.twig
  // To make it easier to match the template with the component, I did not
  // split this further into sub-components on purpose!
  return (
    <div tabIndex={0} className="video-tile" title={video.description}>
      <input id={video.id} type="checkbox" />

      <label htmlFor={video.id} className="video-tile__content">
        <div
          className="video-tile__image"
          role="img"
          style={{ backgroundImage: `url(${video.url.thumbnail})` }}
        />
        <span className="tile__title">{video.name}</span>
        <i className="tile__action-icon fas fa-arrow-down"></i>
      </label>

      <div className="tile__actions">
        <a href={`video/play/${video.id}`}>
          <i className="fas fa-play"></i>Video abspielen
        </a>

        <button onClick={unfavorVideo}>
          <i className="fa-solid fa-star"></i> Video entfavorisieren
        </button>
      </div>
    </div>
  )
}

export default React.memo(VideoTile)
