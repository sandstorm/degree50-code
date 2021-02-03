import React, { useCallback } from 'react'
import MediaItems from './MediaItems'
import { MediaItem, VideoListsState } from '../../types'
import MediaTrack from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import { MEDIA_LANE_HEIGHT, MEDIA_LANE_TOOLBAR_HEIGHT } from './useMediaLane'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
import PreviousSolutions from './PreviousSolutions'
import { actions, selectors, VideoEditorState } from '../../VideoEditorSlice'
import { connect } from 'react-redux'

type OwnProps = {
    mediaItems: MediaItem<any>[]
    updateMediaItem: (item: MediaItem<any>, updatedValues: Record<string, unknown>) => void // FIXME refine key
    removeMediaItem: (item: MediaItem<any>) => void
    checkMediaItem: (item: MediaItem<any>) => boolean
    showTextInMediaItems?: boolean
    amountOfLanes?: number
    ToolbarActions?: React.ReactNode
    previousSolutions?: Array<{ userId: string; userName: string; solution: VideoListsState }>
    $containerRef: React.RefObject<HTMLDivElement>
    containerHeight: number
    containerWidth: number
    onClickLane: (time: number) => void
}

const mapStateToProps = (state: VideoEditorState) => ({
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
    currentTime: selectors.player.selectSyncPlayPosition(state),
})

const mapDispatchToProps = {
    setPlayPosition: actions.player.setPlayPosition,
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
    showTextInMediaItems = true,
    amountOfLanes,
    mediaLaneRenderConfig,
    $containerRef,
    containerHeight,
    containerWidth,
    onClickLane,
}: Props) => {
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
        <>
            <div className="video-editor-timeline__entry" style={{ height: mediaEntryHeight }}>
                <div ref={$containerRef} className="media-track">
                    <MediaTrack
                        mediaTrackConfig={mediaTrackConfig}
                        containerHeight={containerHeight}
                        containerWidth={containerWidth}
                    />
                </div>
                <MediaTrackInteractionArea renderConfig={mediaLaneRenderConfig} clickCallback={onClickLane} />
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
                handleLaneClick={onClickLane}
                renderConfig={mediaLaneRenderConfig}
            />
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MediaLane))
