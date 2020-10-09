import React, { useCallback, useRef } from 'react'
import MediaItems from './MediaItems'
import { MediaItem } from '../types'
import MediaTrack from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import Toolbar from './Toolbar'
import { actions } from '../../../PlayerSlice'
import { useMediaLane, MEDIA_LANE_HEIGHT, MEDIA_LANE_TOOLBAR_HEIGHT } from './useMediaLane'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
import { VideoListsState } from '../../../VideoListsSlice'
import PreviousSolutions from './PreviousSolutions'

type Props = {
    currentTime: number
    mediaItems: MediaItem<any>[]
    updateMediaItem: (item: MediaItem<any>, updatedValues: Record<string, unknown>) => void // FIXME refine key
    removeMediaItem: (item: MediaItem<any>) => void
    setPlayPosition: typeof actions.setPlayPosition
    checkMediaItem: (item: MediaItem<any>) => boolean
    videoDuration: number
    showTextInMediaItems?: boolean
    amountOfLanes?: number
    ToolbarActions?: React.ReactNode
    previousSolutions?: Array<{ userId: string; userName: string; solution: VideoListsState }>
}

const MediaLane = ({
    currentTime,
    updateMediaItem,
    removeMediaItem,
    mediaItems,
    previousSolutions,
    setPlayPosition,
    checkMediaItem,
    videoDuration,
    showTextInMediaItems = true,
    amountOfLanes,
    ToolbarActions,
}: Props) => {
    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { containerWidth, containerHeight, handleZoom, renderConfig, handleLaneClick } = useMediaLane({
        $container,
        currentTime,
        videoDuration,
        laneClickCallback: setPlayPosition,
    })

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
                    <MediaItems
                        currentTime={currentTime}
                        renderConfig={renderConfig}
                        mediaItems={mediaItems}
                        updateMediaItem={handleMediaItemUpdate}
                        removeMediaItem={removeMediaItem}
                        checkMediaItem={checkMediaItem}
                        amountOfLanes={amountOfLanes}
                        showTextInMediaItems={showTextInMediaItems}
                        height={MEDIA_LANE_HEIGHT - MEDIA_LANE_TOOLBAR_HEIGHT - mediaTrackConfig.rulerHeight}
                    />
                </div>
                <PreviousSolutions
                    previousSolutions={previousSolutions}
                    handleLaneClick={handleLaneClick}
                    renderConfig={renderConfig}
                />
            </div>
        </div>
    )
}

export default React.memo(MediaLane)
