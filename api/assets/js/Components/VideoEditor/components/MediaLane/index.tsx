import React, { useCallback } from 'react'
import MediaItems from './MediaItems'
import { MediaItem } from '../../types'
import MediaTrack from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import { MEDIA_LANE_HEIGHT } from './useMediaLane'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
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
    $mediaTrackRef: React.RefObject<HTMLDivElement> | React.RefCallback<HTMLDivElement> | null
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
    setPlayPosition,
    checkMediaItem,
    showTextInMediaItems = true,
    amountOfLanes,
    mediaLaneRenderConfig,
    $mediaTrackRef: $mediaTrackRef,
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

    return (
        <>
            <div className="video-editor-timeline__entry">
                <div ref={$mediaTrackRef} className="media-track">
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
                    height={MEDIA_LANE_HEIGHT - mediaTrackConfig.rulerHeight}
                />
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MediaLane))
