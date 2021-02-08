import React, { useCallback } from 'react'
import ReadOnlyMediaItems from './ReadOnyMediaItems'
import { MediaItem, MediaItemType } from 'Components/VideoEditor/types'
import { useDebouncedResizeObserver } from 'Components/VideoEditor/utils/useDebouncedResizeObserver'
import MediaTrack, { RenderConfig } from '../MediaLane/MediaTrack'
import { defaultMediaTrackConfig } from '../MediaLane/MediaTrack/helpers'
import MediaTrackInteractionArea from '../MediaLane/MediaTrackInteractionArea'

type Props = {
    updateCurrentTime: (time: number) => void
    mediaItems: MediaItem<MediaItemType>[]
    showTextInMediaItems: boolean
    renderConfig: RenderConfig
}

const ReadOnlyMediaLane = ({ updateCurrentTime, mediaItems, showTextInMediaItems, renderConfig }: Props) => {
    const rulerHeight = renderConfig.drawRuler ? defaultMediaTrackConfig.rulerHeight : 10
    const mediaTrackConfig = {
        ...defaultMediaTrackConfig,
        rulerHeight: rulerHeight,
        render: renderConfig,
    }

    const { width: containerWidth, height: containerHeight, ref } = useDebouncedResizeObserver(undefined, 500)

    const amountOfLanes = Math.max(
        0,
        ...mediaItems.map((item) => {
            return item.lane
        })
    )

    const heightPerLane = 60
    const mediaTrackHeight = (amountOfLanes + 1) * heightPerLane + rulerHeight

    const handleLaneClick = useCallback(
        (clickTime) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0
            updateCurrentTime(newCurrentTime)
        },
        [updateCurrentTime]
    )

    return (
        <div className="video-editor-timeline" style={{ height: mediaTrackHeight }}>
            <div className="video-editor-timeline__entry">
                <div ref={ref} className="media-track">
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
                    amountOfLanes={amountOfLanes}
                    showTextInMediaItems={showTextInMediaItems}
                    height={mediaTrackHeight - rulerHeight}
                />
            </div>
        </div>
    )
}

export default ReadOnlyMediaLane
