import React, { useCallback } from 'react'
import ReadOnlyMediaItems from './ReadOnyMediaItems'
import { MediaItem, Annotation, VideoCode, Cut } from 'Components/VideoEditor/types'
import { useDebouncedResizeObserver } from 'Components/VideoEditor/utils/useDebouncedResizeObserver'
import MediaTrack, { RenderConfig } from '../../../../../Components/VideoEditor/components/MediaLane/MediaTrack'
import { defaultMediaTrackConfig } from '../../../../../Components/VideoEditor/components/MediaLane/MediaTrack/helpers'
import MediaTrackInteractionArea from '../../../../../Components/VideoEditor/components/MediaLane/MediaTrackInteractionArea'
import { solveConflicts } from 'Components/VideoEditor/utils/solveItemConflicts'

type Props = {
    updateCurrentTime: (time: number) => void
    entities: Array<Annotation | VideoCode | Cut>
    showTextInMediaItems: boolean
    renderConfig: RenderConfig
}

const ReadOnlyMediaLane = ({ updateCurrentTime, entities, showTextInMediaItems, renderConfig }: Props) => {
    const itemsFromAnnotations = entities.map(
        (annotation) =>
            new MediaItem({
                start: annotation.start,
                end: annotation.end,
                text: annotation.text,
                memo: annotation.memo,
                originalData: annotation,
                lane: 0,
            })
    )

    const mediaItems = solveConflicts(itemsFromAnnotations)

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
