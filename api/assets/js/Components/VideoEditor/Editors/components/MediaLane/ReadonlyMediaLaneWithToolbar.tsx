import React, { useCallback, useRef } from 'react'
import { MediaItem } from '../types'
import MediaTrack from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import Toolbar from './Toolbar'
import { actions } from '../../../PlayerSlice'
import { useMediaLane, MEDIA_LANE_HEIGHT, MEDIA_LANE_TOOLBAR_HEIGHT } from './useMediaLane'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
import ReadOnlyMediaItems from '../ReadOnlyMediaLane/ReadOnyMediaItems'

type Props = {
    currentTime: number
    mediaItems: MediaItem<any>[]
    setPlayPosition: typeof actions.setPlayPosition
    videoDuration: number
    showTextInMediaItems?: boolean
    amountOfLanes?: number
    ToolbarActions?: React.ReactNode
}

const ReadonlyMediaLaneWithToolbar = ({
    currentTime,
    mediaItems,
    setPlayPosition,
    videoDuration,
    showTextInMediaItems = true,
    amountOfLanes,
    ToolbarActions,
}: Props) => {
    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { containerWidth, containerHeight, handleZoom, handleLaneClick, renderConfig } = useMediaLane({
        $container,
        currentTime,
        videoDuration,
        laneClickCallback: setPlayPosition,
    })

    const mediaTrackConfig = {
        ...defaultMediaTrackConfig,
        render: renderConfig,
    }

    return (
        <div className="video-editor-timeline" style={{ height: MEDIA_LANE_HEIGHT }}>
            <Toolbar
                zoomHandler={handleZoom}
                videoDuration={videoDuration}
                renderConfig={renderConfig}
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

                    <MediaTrackInteractionArea renderConfig={renderConfig} clickCallback={handleLaneClick} />

                    <ReadOnlyMediaItems
                        renderConfig={renderConfig}
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

export default React.memo(ReadonlyMediaLaneWithToolbar)
