import React, { useState, useMemo } from 'react'
import { connect } from 'react-redux'
import { selectConfig } from '../Config/ConfigSlice'
import VideoPlayer from './VideoPlayer'
import { AppState } from '../../Store/Store'
import { VideoJsPlayerOptions } from 'video.js'

export type Video = {
    id: string
    name: string
    description: string
    url: { hls: string; mp4: string }
    duration: string
}

const mapStateToProps = (state: AppState) => ({
    videos: selectConfig(state).videos,
})

type AdditionalProps = {
    updateCurrentTime: (time: number) => void
    videoNodeRef: React.RefObject<HTMLVideoElement>
}

type VideoPlayerWrapperProps = AdditionalProps & ReturnType<typeof mapStateToProps>

const VideoPlayerWrapper: React.FC<VideoPlayerWrapperProps> = (props) => {
    const [activeVideoIndex, setActiveVideoIndex] = useState(0)

    const activeVideo = props.videos[activeVideoIndex]

    // recalculates when and only when the activeVideo changes
    const videoPlayerOptions: VideoJsPlayerOptions = useMemo(
        () => ({
            autoplay: false,
            controls: true,
            sources: [
                {
                    src: activeVideo.url.hls,
                },
            ],
        }),
        [activeVideo]
    )

    const actions = useMemo(() => {
        const hasNextVideo = activeVideoIndex < props.videos.length - 1
        const handleNext = () => {
            if (hasNextVideo) {
                setActiveVideoIndex(activeVideoIndex + 1)
            }
        }

        const hasPreviousVideo = activeVideoIndex > 0
        const handlePrevious = () => {
            if (hasPreviousVideo) {
                setActiveVideoIndex(activeVideoIndex - 1)
            }
        }
        if (props.videos.length === 1) {
            return null
        }
        return (
            <div className={'video-player-wrapper__actions'}>
                <button className={'btn btn-primary'} disabled={!hasPreviousVideo} onClick={handlePrevious}>
                    Vorheriges Video
                </button>
                <button className={'btn btn-primary'} disabled={!hasNextVideo} onClick={handleNext}>
                    Nächstes Video
                </button>
            </div>
        )
    }, [props.videos, activeVideoIndex])

    return (
        <div className="video-player-wrapper" aria-label={''}>
            <div className={'video-player-wrapper__videos'}>
                <div key={activeVideo.id} className={'video-player-wrapper__video'}>
                    <header>
                        <h4>{activeVideo.name}</h4>
                    </header>
                    <VideoPlayer
                        videoJsOptions={videoPlayerOptions}
                        updateCurrentTime={props.updateCurrentTime}
                        videoNodeRef={props.videoNodeRef}
                    />
                    {activeVideo.description}
                </div>
            </div>
            {actions}
        </div>
    )
}

export default connect(mapStateToProps)(VideoPlayerWrapper)
