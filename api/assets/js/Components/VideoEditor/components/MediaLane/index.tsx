import React, { useCallback, useRef } from 'react'
import MediaItems from './MediaItems'
import { MediaItem, VideoListsState } from '../../types'
import MediaTrack from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import Toolbar from './Toolbar'
import { useMediaLane, MEDIA_LANE_HEIGHT, MEDIA_LANE_TOOLBAR_HEIGHT } from './useMediaLane'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
import PreviousSolutions from './PreviousSolutions'
import { actions, selectors, VideoEditorState } from '../../VideoEditorSlice'
import { connect } from 'react-redux'

type OwnProps = {
    currentTime: number
    mediaItems: MediaItem<any>[]
    updateMediaItem: (item: MediaItem<any>, updatedValues: Record<string, unknown>) => void // FIXME refine key
    removeMediaItem: (item: MediaItem<any>) => void
    setPlayPosition: typeof actions.player.setPlayPosition
    checkMediaItem: (item: MediaItem<any>) => boolean
    videoDuration: number
    showTextInMediaItems?: boolean
    amountOfLanes?: number
    ToolbarActions?: React.ReactNode
    previousSolutions?: Array<{ userId: string; userName: string; solution: VideoListsState }>
}

const mapStateToProps = (state: VideoEditorState) => ({
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    setRenderConfig: actions.mediaLaneRenderConfig.setRenderConfig,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

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
        render: mediaLaneRenderConfig,
    }

    const mediaEntryHeight =
        previousSolutions && previousSolutions.length > 0
            ? MEDIA_LANE_HEIGHT - 100 - MEDIA_LANE_TOOLBAR_HEIGHT
            : MEDIA_LANE_HEIGHT - MEDIA_LANE_TOOLBAR_HEIGHT

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
                <div className="video-editor-timeline__entry" style={{ height: mediaEntryHeight }}>
                    <div ref={$container} className="media-track">
                        <MediaTrack
                            mediaTrackConfig={mediaTrackConfig}
                            containerHeight={containerHeight}
                            containerWidth={containerWidth}
                        />
                    </div>
                    <MediaTrackInteractionArea renderConfig={mediaLaneRenderConfig} clickCallback={handleLaneClick} />
                    <MediaItems
                        currentTime={currentTime}
                        renderConfig={mediaLaneRenderConfig}
                        mediaItems={mediaItems}
                        updateMediaItem={handleMediaItemUpdate}
                        removeMediaItem={removeMediaItem}
                        checkMediaItem={checkMediaItem}
                        amountOfLanes={amountOfLanes}
                        showTextInMediaItems={showTextInMediaItems}
                        height={mediaEntryHeight - mediaTrackConfig.rulerHeight}
                    />
                </div>
                <PreviousSolutions
                    previousSolutions={previousSolutions}
                    handleLaneClick={handleLaneClick}
                    renderConfig={mediaLaneRenderConfig}
                />
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MediaLane))
