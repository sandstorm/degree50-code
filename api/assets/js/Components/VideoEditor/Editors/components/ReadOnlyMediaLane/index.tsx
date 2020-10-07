import React, { useCallback, useRef } from 'react'
import ReadOnlyMediaItems from './ReadOnyMediaItems'
import { MediaItem } from '../types'
import ReadOnlyMediaTrack from '../MediaLane/MediaTrack/index'
import { RenderConfig } from '../MediaLane/MediaTrack'
import MediaTrackInteractionArea from '../MediaLane/MediaTrackInteractionArea'
import { MediaItemType, VideoCode } from 'Components/VideoEditor/VideoListsSlice'
import { useDebouncedResizeObserver } from '../../utils/useDebouncedResizeObserver'
import { defaultMediaTrackConfig } from '../MediaLane/MediaTrack/helpers'

type Props = {
    updateCurrentTime: (time: number) => void
    mediaItems: MediaItem<MediaItemType>[]
    showTextInMediaItems: boolean
    renderConfig: RenderConfig
}

const ReadOnlyMediaLane = ({ updateCurrentTime, mediaItems, showTextInMediaItems, renderConfig }: Props) => {
    const rulerHeight = renderConfig.drawRuler ? 40 : 10
    const mediaTrackConfig = {
        ...defaultMediaTrackConfig,
        rulerHeight: rulerHeight,
        render: renderConfig,
    }
    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { width: containerWidth, height: containerHeight } = useDebouncedResizeObserver($container, 500)

    const amountOfLanes = Math.max(
        0,
        ...mediaItems.map((item: MediaItem<VideoCode>) => {
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
                <div ref={$container} className="media-track">
                    <ReadOnlyMediaTrack
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
