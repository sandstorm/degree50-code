import React from 'react';
import {connect} from 'react-redux';
import {selectConfig} from "../Config/ConfigSlice";
import VideoPlayer from "./VideoPlayer";
import {selectActiveVideo, selectActiveVideoIndex, setVideo, setVideoIndex} from "./VideoPlayerWrapperSlice";

export type Video = {
    id: string
    name: string
    description: string
    url: string
}

const mapStateToProps = (state: any) => ({
    videos: selectConfig(state).videos,
    activeVideo: selectActiveVideo(state),
    activeVideoIndex: selectActiveVideoIndex(state),
})

const mapDispatchToProps = (dispatch: any, ) => ({
    setVideo: (video: Video) => {
        dispatch(setVideo(video))
    },
    setVideoIndex: (index: number) => {
        dispatch(setVideoIndex(index))
    }
})

type AdditionalProps = {
    // currently none
}

type VideoPlayerProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const VideoPlayerWrapper: React.FC<VideoPlayerProps> = ({...props}) => {

    let activeVideo = props.activeVideo
    // select first if no active video is in state
    if(!activeVideo) {
        activeVideo = props.videos[0]
    }

    const videoPlayerOptions = {
        autoplay: false,
        controls: true,
        sources: [{
            src: activeVideo.url,
        }]
    }

    const video = <div key={activeVideo.id} className={'video-player-wrapper__video'}>
        <header><h4>{activeVideo.name}</h4></header>
        <VideoPlayer {...videoPlayerOptions} />
        {activeVideo.description}
    </div>

    console.log (props.activeVideoIndex)
    const setVideo = (videos: Array<Video>, index: number) => {
        console.log(videos.length, index)
        if (index < 0) {
            return
        }
        if (index > videos.length - 1) {
            return
        }

        console.log('set new video')
        props.setVideo(videos[index])
        props.setVideoIndex(index)
    }

    let actions = null;
    if (props.videos.length > 1) {
        const prevButtonDisabled = props.activeVideoIndex === 0
        const nextButtonDisabled = props.activeVideoIndex === props.videos.length - 1
        actions = <div className={'video-player-wrapper__actions'}>
            <button className={'btn btn-primary'} disabled={prevButtonDisabled} onClick={() => setVideo(props.videos, props.activeVideoIndex - 1)}>Vorheriges Video</button>
            <button className={'btn btn-primary'} disabled={nextButtonDisabled} onClick={() => setVideo(props.videos, props.activeVideoIndex + 1)}>Nächstes Video</button>
        </div>
    }

    return (
        <div className='video-player-wrapper' aria-label={''}>
            <div className={'video-player-wrapper__videos'}>
                {video}
            </div>
            {actions}
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(VideoPlayerWrapper)