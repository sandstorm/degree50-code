import React, { useRef } from 'react'
import { MediaItem } from '../types'
import MediaTrack from './MediaLane/MediaTrack'
import MediaTrackInteractionArea from './MediaLane/MediaTrackInteractionArea'
import Toolbar from './MediaLaneToolbar'
import { useMediaLane, MEDIA_LANE_HEIGHT, MEDIA_LANE_TOOLBAR_HEIGHT } from './MediaLane/useMediaLane'
import { defaultMediaTrackConfig } from './MediaLane/MediaTrack/helpers'
import ReadOnlyMediaItems from './ReadOnlyMediaLane/ReadOnyMediaItems'
import { actions, selectors, VideoEditorState } from '../VideoEditorSlice'
import { connect } from 'react-redux'

type OwnProps = {
    currentTime: number
    mediaItems: MediaItem<any>[]
    setPlayPosition: typeof actions.player.setPlayPosition
    videoDuration: number
    showTextInMediaItems?: boolean
    amountOfLanes?: number
    ToolbarActions?: React.ReactNode
}

const mapStateToProps = (state: VideoEditorState) => ({
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    setRenderConfig: actions.mediaLaneRenderConfig.setRenderConfig,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ReadonlyMediaLaneWithToolbar = ({
    currentTime,
    mediaItems,
    setPlayPosition,
    videoDuration,
    showTextInMediaItems = true,
    amountOfLanes,
    ToolbarActions,
    mediaLaneRenderConfig,
    setRenderConfig,
}: Props) => {
    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { containerWidth, containerHeight, handleZoom, handleLaneClick } = useMediaLane({
        $container,
        currentTime,
        videoDuration,
        laneClickCallback: setPlayPosition,
        renderConfig: mediaLaneRenderConfig,
        setRenderConfig,
    })

    const mediaTrackConfig = {
        ...defaultMediaTrackConfig,
        render: mediaLaneRenderConfig,
    }

    return (
        <div className="video-editor-timeline" style={{ height: MEDIA_LANE_HEIGHT }}>
            <Toolbar
                zoomHandler={handleZoom}
                videoDuration={videoDuration}
                renderConfig={mediaLaneRenderConfig}
                handleTimeLineAction={handleLaneClick}
            >
                {ToolbarActions}
            </Toolbar>

            <div
                className={'video-editor-timeline__entries'}
                style={{ height: MEDIA_LANE_HEIGHT - MEDIA_LANE_TOOLBAR_HEIGHT }}
            >
                <div
                    className="video-editor-timeline__entry"
                    style={{ height: MEDIA_LANE_HEIGHT - MEDIA_LANE_TOOLBAR_HEIGHT }}
                >
                    <div ref={$container} className="media-track">
                        <MediaTrack
                            mediaTrackConfig={mediaTrackConfig}
                            containerHeight={containerHeight}
                            containerWidth={containerWidth}
                        />
                    </div>

                    <MediaTrackInteractionArea renderConfig={mediaLaneRenderConfig} clickCallback={handleLaneClick} />

                    <ReadOnlyMediaItems
                        renderConfig={mediaLaneRenderConfig}
                        mediaItems={mediaItems}
                        amountOfLanes={amountOfLanes ?? 0}
                        showTextInMediaItems={showTextInMediaItems}
                        height={MEDIA_LANE_HEIGHT - MEDIA_LANE_TOOLBAR_HEIGHT - mediaTrackConfig.rulerHeight}
                    />
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ReadonlyMediaLaneWithToolbar))
