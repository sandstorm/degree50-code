import React, { useState, useCallback, useRef } from 'react'
import { MediaItem } from '../types'
import MediaTrack from './MediaTrack'
import { RenderConfig } from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import Toolbar from './Toolbar'
import { actions } from '../../../PlayerSlice'
import { INITIAL_ZOOM, useMediaLane } from './utils'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
import ReadOnlyMediaItems from '../ReadOnlyMediaLane/ReadOnyMediaItems'

export const MEDIA_LANE_HEIGHT = 200
export const MEDIA_LANE_TOOLBAR_HEIGHT = 40

const initialRender: RenderConfig = {
    padding: 0,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
    drawRuler: true,
}

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
    // TODO this should later become part of the api and probably the redux store
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)

    const { containerWidth, containerHeight, getDurationForRenderConfig, getRenderConfigForZoom } = useMediaLane({
        setRender,
        $container,
        renderConfig,
        currentTime,
        videoDuration,
    })

    initialRender.duration = getDurationForRenderConfig(INITIAL_ZOOM)
    initialRender.gridNum = initialRender.duration * 10 + initialRender.padding * 2
    initialRender.gridGap = containerWidth / initialRender.gridNum

    const handleLaneClick = useCallback(
        (clickTime) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0

            setPlayPosition(newCurrentTime)

            const newTimelineStartTime = Math.floor(newCurrentTime / renderConfig.duration) * renderConfig.duration

            setRender({
                ...renderConfig,
                currentTime: newCurrentTime,
                timelineStartTime: newTimelineStartTime,
            })
        },
        [renderConfig]
    )

    const handleZoom = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newRenderConfig = getRenderConfigForZoom(parseInt(event.currentTarget.value))

            setRender({
                ...renderConfig,
                ...newRenderConfig,
            })
        },
        [renderConfig]
    )

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
