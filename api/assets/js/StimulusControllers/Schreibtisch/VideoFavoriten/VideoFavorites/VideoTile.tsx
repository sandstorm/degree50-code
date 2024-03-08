import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { useCallback } from 'react'
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

    const favouritesButton = (
        <button
            tabIndex={0}
            id={`favor-button--${video.id}`}
            onClick={unfavorVideo}
            className="tile__favor-button"
            title="Entfavorisieren"
            type={'button'}
        >
            <i className="fa-solid fa-star-sharp" data-test-id={`remove-video-from-favorites--${video.id}`}></i>
        </button>
    )

    const myVideoTile = (
        <div tabIndex={0} className="tile" title={video.description}>
            {favouritesButton}
            <input id={video.id} type="checkbox" />
            <label htmlFor={video.id} className="tile__content">
                <img className="tile__image" alt={'Vorschaubild'} src={video.url.thumbnail} />
                <span id={`tile__title--${video.id}`} className="tile__title">
                    {video.name}
                </span>
                <i className="tile__action-icon fas fa-arrow-down"></i>
            </label>
            <div className="tile__actions">
                <a href={`/video/play/${video.id}`}>
                    <i className="fas fa-play"></i> Video anschauen
                </a>
                <a href={`/video/edit/${video.id}`}>
                    <i className="fas fa-pencil-alt"></i> Video bearbeiten
                </a>
                <a href={`/video/delete/${video.id}`} className="color-alert">
                    <i className="fas fa-trash-alt"></i> Video löschen
                </a>
            </div>
        </div>
    )

    const videoTile = (
        <div tabIndex={0} className="tile" title={video.description}>
            {favouritesButton}
            <a href={`video/play/${video.id}`} className="tile__content">
                <img className="tile__image" alt={'Vorschaubild'} src={video.url.thumbnail} />
                <span id={`tile__title--${video.id}`} className="tile__title">
                    {video.name}
                </span>
                <i className="tile__action-icon fas fa-arrow-right"></i>
            </a>
        </div>
    )

    // NOTE: This is basically a copy of a tile from Video.html.twig
    // To make it easier to match the template with the component, I did not
    // split this further into sub-components on purpose!
    if (video.userIsCreator) {
        return myVideoTile
    } else {
        return videoTile
    }
}

export default React.memo(VideoTile)
