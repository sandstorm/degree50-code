import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import React, { FC, memo } from 'react'
import MediaLaneContainer from './components/MediaLaneContainer'
import OverlayContainer from './components/OverlayContainer'
import Toolbar from './components/Toolbar'
import { useShortCuts } from './ShortCutsContext/useShortCuts'
import { CustomVideoControl } from '../VideoPlayer/VideoJSPlayer'
import { SetVideoPlayerTimeOverlayId } from './SetVideoPlayerTimeContext/SetVideoPlayerTimeMenu'
import { AnyAction } from '@reduxjs/toolkit'
import { openOverlayAction } from './ShortCutsContext/shortCutSagas/openOverlayShortCutSaga'

type Props = {
    videos: Array<Video>
}

const SetPlayerTimeControl: CustomVideoControl<AnyAction> = {
    controlText: 'Springe zu Zeit in Video',
    ariaLabel: 'Springe zu Zeit in Video',
    iconClassNames: ['far', 'fa-stopwatch'],
    action: openOverlayAction(SetVideoPlayerTimeOverlayId),
    indexPosition: 1,
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
                customVideoControls={[SetPlayerTimeControl]}
            />
            <Toolbar />
            <OverlayContainer />
            <MediaLaneContainer />
        </div>
    )
}

export default memo(VideoEditor)
