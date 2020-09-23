import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReadOnlyMediaItems from './ReadOnyMediaItems'
import { MediaItem } from '../types'
import ReadOnlyMediaTrack from '../MediaLane/MediaTrack/index'
import { RenderConfig } from '../MediaLane/MediaTrack'
import MediaTrackInteractionArea from '../MediaLane/MediaTrackInteractionArea'
import { useMediaLane } from '../MediaLane/utils'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'
import { useDebouncedResizeObserver } from '../../utils/useDebouncedResizeObserver'

type Props = {
    updateCurrentTime: (time: number) => void
    mediaItems: MediaItem<MediaItemType>[]
    amountOfLanes: number
    showTextInMediaItems: boolean
    renderConfig: RenderConfig
}

const ReadOnlyMediaLane = ({
    updateCurrentTime,
    mediaItems,
    amountOfLanes,
    showTextInMediaItems,
    renderConfig,
}: Props) => {
    const mediaTrackConfig = {} // TODO
    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { width: containerWidth, height: containerHeight } = useDebouncedResizeObserver($container, 500)

    const handleLaneClick = useCallback(
        (clickTime) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0
            updateCurrentTime(newCurrentTime)
        },
        [updateCurrentTime]
    )

    return (
        <div className="video-editor-timeline">
            <div className="video-editor-timeline__body">
                <div ref={$container} className="media-track">
                    <ReadOnlyMediaTrack
                        config={mediaTrackConfig} /* empty object = use default values */
                        renderConfig={renderConfig}
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
                />
            </div>
        </div>
    )
}

export default ReadOnlyMediaLane
