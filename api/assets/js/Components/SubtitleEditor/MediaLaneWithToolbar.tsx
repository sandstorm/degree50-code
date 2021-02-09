import React, { useCallback, useRef } from 'react'
import MediaItems from '../VideoEditor/components/MediaLane/MediaItems'
import { MediaItem, VideoListsState } from '../VideoEditor/types'
import MediaTrack from '../VideoEditor/components/MediaLane/MediaTrack'
import MediaTrackInteractionArea from '../VideoEditor/components/MediaLane/MediaTrackInteractionArea'
import Toolbar from '../VideoEditor/components/MediaLaneToolbar'
import {
    useMediaLaneRendering,
    MEDIA_LANE_HEIGHT,
    MEDIA_LANE_TOOLBAR_HEIGHT,
} from '../VideoEditor/components/MediaLane/useMediaLaneRendering'
import { defaultMediaTrackConfig } from '../VideoEditor/components/MediaLane/MediaTrack/helpers'
import { actions, selectors, VideoEditorState } from '../VideoEditor/VideoEditorSlice'
import { connect } from 'react-redux'
import { useMediaLaneClick } from 'Components/VideoEditor/components/MediaLane/useMediaLaneClick'
import { SubtitlesSlice } from './SubtitlesSlice'

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
    updateZoom: actions.mediaLaneRenderConfig.updateZoom,
    removeSubtitle: SubtitlesSlice.actions.remove,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const MediaLane = (props: Props) => {
    const {
        currentTime,
        updateMediaItem,
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
        updateZoom,
    } = props

    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { containerWidth, containerHeight } = useMediaLaneRendering({
        $mediaTrackRef: $container,
        currentTime,
        videoDuration,
        renderConfig: mediaLaneRenderConfig,
        setRenderConfig,
    })

    const { handleMediaLaneClick } = useMediaLaneClick(mediaLaneRenderConfig, setRenderConfig, setPlayPosition)

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
                updateZoom={updateZoom}
                videoDuration={videoDuration}
                renderConfig={mediaLaneRenderConfig}
                handleTimeLineAction={handleMediaLaneClick}
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
                    <MediaTrackInteractionArea
                        renderConfig={mediaLaneRenderConfig}
                        clickCallback={handleMediaLaneClick}
                    />
                    <MediaItems
                        currentTime={currentTime}
                        renderConfig={mediaLaneRenderConfig}
                        mediaItems={mediaItems}
                        updateMediaItem={handleMediaItemUpdate}
                        removeMediaItem={props.removeSubtitle}
                        checkMediaItem={checkMediaItem}
                        amountOfLanes={amountOfLanes}
                        showTextInMediaItems={showTextInMediaItems}
                        height={mediaEntryHeight - mediaTrackConfig.rulerHeight}
                    />
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MediaLane))
