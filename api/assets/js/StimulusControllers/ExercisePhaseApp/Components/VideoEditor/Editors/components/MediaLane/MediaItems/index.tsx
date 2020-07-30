import React, { useRef } from 'react'
import MediaItem from './MediaItem'
import { MediaItem as MediaItemType } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { useItemInteraction } from './useItemInteraction'
import { itemIsVisible } from './helpers'

const renderItems = (
    mediaItems: MediaItemType[],
    renderConfig: RenderConfig,
    gridGap: number,
    activeItemIndex: number,
    handlers: {
        onItemMouseDown: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            item: MediaItemType,
            side: 'left' | 'right' | 'center'
        ) => void
    }
) =>
    mediaItems.map((item, index) => {
        if (!itemIsVisible(item, renderConfig.timelineStartTime, renderConfig.duration)) {
            return null
        }

        return (
            <MediaItem
                key={index}
                id={index}
                item={item}
                renderConfig={renderConfig}
                gridGap={gridGap}
                isPlayedBack={activeItemIndex === index}
                {...handlers}
            />
        )
    })

type Props = {
    mediaItems: MediaItemType[]
    renderConfig: RenderConfig
    gridGap: number
    currentTime: number
    updateMediaItem: (
        item: MediaItemType,
        updatedValues: { start?: string; end?: string },
        newStartTime: number
    ) => void
}

const MediaItems = ({ mediaItems, renderConfig, gridGap, updateMediaItem, currentTime }: Props) => {
    const $mediaItemsRef: React.RefObject<HTMLDivElement> = useRef(null)
    const { onItemMouseDown } = useItemInteraction(mediaItems, renderConfig, gridGap, $mediaItemsRef, updateMediaItem)
    const activeItemIndex = mediaItems.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime)

    return (
        <div className="video-editor__media-items">
            <div ref={$mediaItemsRef}>
                {renderItems(mediaItems, renderConfig, gridGap, activeItemIndex, {
                    onItemMouseDown,
                })}
            </div>
        </div>
    )
}

export default React.memo(MediaItems)
