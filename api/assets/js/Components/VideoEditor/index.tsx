import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { FC, memo } from 'react'
import { TabsTypesEnum } from 'types'
import { VideoCodePrototype } from './Editors/VideoCodeEditor/types'
import MediaLaneContainer from './MediaLaneContainer'
import OverlayContainer from './Toolbar/OverlayContainer/OverlayContainer'
import Toolbar from './Toolbar/Toolbar'

type Props = {
    videos: Array<Video>
    components: Array<TabsTypesEnum>
    height: number
    itemUpdateCondition: boolean
    videoCodesPool: VideoCodePrototype[]
}

const VideoEditor: FC<Props> = (props) => {
    const firstVideo = props.videos[0]

    return (
        <div className="video-editor">
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
