import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { FC, memo } from 'react'
import MediaLaneContainer from './components/MediaLaneContainer'
import OverlayContainer from './components/OverlayContainer'
import Toolbar from './components/Toolbar'
import { useShortCuts } from './ShortCutsContext/useShortCuts'

type Props = {
    videos: Array<Video>
}

const VideoEditor: FC<Props> = (props) => {
    const firstVideo = props.videos[0]

    useShortCuts()

    return (
        <div className="video-editor" data-test-id="videoEditor">
            <ConnectedVideoJSPlayer
                videoJsOptions={{
                    autoplay: false,
                    controls: true,
                    sources: [
                        {
                            src: firstVideo?.url?.hls || '',
                        },
                    ],
                    fluid: false,
                    // @ts-ignore
                    fill: true,
                }}
                videoMap={firstVideo}
            />
            <Toolbar />
            <OverlayContainer />
            <MediaLaneContainer />
        </div>
    )
}

export default memo(VideoEditor)
