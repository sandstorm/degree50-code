import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { FC, memo, useState } from 'react'
import { TabsTypesEnum } from 'types'
import AnnotationMedialane from './AnnotationMedialane'
import { VideoCodePrototype } from './Editors/VideoCodeEditor/types'
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
    const [showMediaLane, toggleShowMediaLane] = useState(false)

    const firstVideo = props.videos[0]
    const firstVideoDuration = firstVideo ? firstVideo.duration : 5 // duration in seconds

    const handleMediaLaneToggle = () => toggleShowMediaLane(!showMediaLane)

    return (
        <div className="video-editor">
            <div className="video-container">
                <ConnectedVideoJSPlayer
                    videoJsOptions={{
                        autoplay: false,
                        controls: true,
                        sources: [
                            {
                                src: firstVideo?.url?.hls || '',
                            },
                        ],
                    }}
                    videoMap={firstVideo}
                />
            </div>
            <Toolbar />
            <OverlayContainer />

            <button onClick={handleMediaLaneToggle}>Toggle Medialane</button>

            {showMediaLane && (
                <>
                    <AnnotationMedialane videoDuration={firstVideoDuration} />
                </>
            )}
        </div>
    )
}

export default memo(VideoEditor)
