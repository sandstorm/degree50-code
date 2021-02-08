import React, { useCallback } from 'react'
import MediaItems from './MediaItems'
import { MediaItem } from '../../types'
import MediaTrack from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import { MEDIA_LANE_HEIGHT, useMediaLaneRendering } from './useMediaLaneRendering'
import { defaultMediaTrackConfig } from './MediaTrack/helpers'
import { actions, selectors as videoEditorSelectors, VideoEditorState } from '../../VideoEditorSlice'
import { connect } from 'react-redux'
import { useMediaLaneClick } from './useMediaLaneClick'
import {
    selectors as configSelectors,
    ConfigStateSlice,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

type OwnProps = {
    mediaItems: MediaItem<any>[]
    updateMediaItem: (item: MediaItem<any>, updatedValues: Record<string, unknown>) => void // FIXME refine key
    removeMediaItem: (id: string) => void
    checkMediaItem: (item: MediaItem<any>) => boolean
    showTextInMediaItems?: boolean
    amountOfLanes?: number
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => ({
    videos: configSelectors.selectVideos(state),
    playerSyncPlayPosition: videoEditorSelectors.player.selectSyncPlayPosition(state),
    mediaLaneRenderConfig: videoEditorSelectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
    currentTime: videoEditorSelectors.player.selectSyncPlayPosition(state),
})

const mapDispatchToProps = {
    setPlayPosition: actions.player.setPlayPosition,
    setRenderConfig: actions.mediaLaneRenderConfig.setRenderConfig,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const MediaLane = (props: Props) => {
    const {
        currentTime,
        updateMediaItem,
        removeMediaItem,
        mediaItems,
        setPlayPosition,
        checkMediaItem,
        showTextInMediaItems = true,
        amountOfLanes,
        mediaLaneRenderConfig,
        setRenderConfig,
    } = props
    const firstVideoDuration = props.videos[0].duration

    const { handleMediaLaneClick } = useMediaLaneClick(mediaLaneRenderConfig, setRenderConfig, setPlayPosition)

    const { containerWidth, containerHeight, ref: $mediaTrackRef } = useMediaLaneRendering({
        currentTime: props.playerSyncPlayPosition,
        videoDuration: firstVideoDuration,
        renderConfig: props.mediaLaneRenderConfig,
        setRenderConfig: props.setRenderConfig,
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
                <MediaTrackInteractionArea renderConfig={mediaLaneRenderConfig} clickCallback={handleMediaLaneClick} />
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
