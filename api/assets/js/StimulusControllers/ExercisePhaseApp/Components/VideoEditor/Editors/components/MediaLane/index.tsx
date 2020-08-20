import React, { useState, useCallback, useRef } from 'react'
import MediaItems from './MediaItems'
import { MediaItem } from '../types'
import MediaTrack, { MediaTrackConfig } from './MediaTrack'
import { RenderConfig } from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import Toolbar from './Toolbar'
import { actions } from '../../../PlayerSlice'
import { useDimensions } from './utils'

const initialRender: RenderConfig = {
    padding: 0,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
}

type Props = {
    currentTime: number
    mediaItems: MediaItem<any>[]
    updateMediaItem: (item: MediaItem<any>, updatedValues: Object) => void // FIXME refine key
    removeMediaItem: (item: MediaItem<any>) => void
    mediaTrackConfig?: MediaTrackConfig
    setPlayPosition: typeof actions.setPlayPosition
    checkMediaItem: (item: MediaItem<any>) => boolean
    videoDuration: number
    showTextInMediaItems?: boolean
    amountOfLanes?: number
    ToolbarActions?: React.ReactNode
}

const MediaLane = ({
    currentTime,
    mediaTrackConfig = {},
    updateMediaItem,
    removeMediaItem,
    mediaItems,
    setPlayPosition,
    checkMediaItem,
    videoDuration,
    showTextInMediaItems = true,
    amountOfLanes,
    ToolbarActions,
}: Props) => {
    const getDurationForRenderConfig = (durationInPercentage: number) => {
        return Math.round((videoDuration / 100) * durationInPercentage)
    }

    const $container: React.RefObject<HTMLDivElement> = useRef(null)
    // TODO this should later become part of the api and probably the redux store
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)

    const { containerWidth, containerHeight } = useDimensions({
        setRender,
        $container,
        renderConfig,
        currentTime,
    })

    initialRender.duration = getDurationForRenderConfig(25)
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

    const handleMediaItemUpdate = useCallback(
        (
            item: MediaItem<any>,
            updatedValues: { start?: string; end?: string; memo?: string },
            newStartTime: number
        ) => {
            updateMediaItem(item, updatedValues)
            setPlayPosition(newStartTime)
        },
        [updateMediaItem]
    )

    const handleZoom = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newDuration = getDurationForRenderConfig(parseInt(event.currentTarget.value))
            const newGridNum = newDuration * 10 + renderConfig.padding * 2
            const newGridGap = containerWidth / newGridNum

            setRender({
                ...renderConfig,
                duration: newDuration,
                gridNum: newGridNum,
                gridGap: newGridGap,
            })
        },
        [renderConfig]
    )

    return (
        <div className="video-editor-timeline">
            <Toolbar
                zoomHandler={handleZoom}
                videoDuration={videoDuration}
                renderConfig={renderConfig}
                handleTimeLineAction={handleLaneClick}
            >
                {ToolbarActions}
            </Toolbar>

            <div className="video-editor-timeline__body">
                <div ref={$container} className="media-track">
                    <MediaTrack
                        config={mediaTrackConfig} /* empty object = use default values */
                        renderConfig={renderConfig}
                        containerHeight={containerHeight}
                        containerWidth={containerWidth}
                    />
                </div>

                <MediaTrackInteractionArea renderConfig={renderConfig} clickCallback={handleLaneClick} />

                <MediaItems
                    currentTime={currentTime}
                    renderConfig={renderConfig}
                    mediaItems={mediaItems}
                    updateMediaItem={handleMediaItemUpdate}
                    removeMediaItem={removeMediaItem}
                    checkMediaItem={checkMediaItem}
                    amountOfLanes={amountOfLanes}
                    showTextInMediaItems={showTextInMediaItems}
                />
            </div>
        </div>
    )
}

export default React.memo(MediaLane)
