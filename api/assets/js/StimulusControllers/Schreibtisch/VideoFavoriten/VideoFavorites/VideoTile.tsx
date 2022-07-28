import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { useCallback, useEffect, useRef } from 'react'
import { useToggleVideoFavoriteMutation } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'

type Props = {
  video: Video
}

const VideoTile = (props: Props) => {
  const { video } = props
  const [sendToggleRequest] = useToggleVideoFavoriteMutation()

  const unfavorVideo = useCallback(
    (e) => {
      e.stopPropagation()
      sendToggleRequest(video.id)
    },
    [video, sendToggleRequest]
  )

  // NOTE: This is basically a copy of a tile from Video.html.twig
  // To make it easier to match the template with the component, I did not
  // split this further into sub-components on purpose!
  return (
    <div
      tabIndex={0}
      className="video-tile"
      title={video.description}
      onClick={(e) => {
        if (video.userIsCreator) {
          e.currentTarget.classList.toggle('video-tile--show-actions')
        }
      }}
    >
      <label htmlFor={video.id} className="video-tile__content">
        <button
          tabIndex={0}
          id="favor-button--{{ video.data.id }}"
          onClick={unfavorVideo}
          className="video-tile__favor-button"
          title="Entfavorisieren"
        >
          <i
            className="fa-solid fa-star-sharp"
            data-test-id="remove-video-from-favorites--{{ video.data.id }}"
          ></i>
        </button>

        <div
          className="video-tile__image"
          role="img"
          style={{ backgroundImage: `url(${video.url.thumbnail})` }}
        />

        <a
          tabIndex={0}
          id="tile__title-{{ video.data.id }}"
          href={`video/play/${video.id}`}
          className="tile__title"
          onClick={(e) => e.stopPropagation()}
        >
          {video.name}
        </a>

        <div className="tile__actions">
          <a href={`/video/edit/${video.id}`} className="color-alert">
            <i className="fas fa-pencil-alt"></i> Video bearbeiten
          </a>
          <a href={`/video/delete/${video.id}`} className="color-alert">
            <i className="fas fa-trash-alt"></i> Video löschen
          </a>
        </div>
      </label>
    </div>
  )
}

export default React.memo(VideoTile)
