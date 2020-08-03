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
    checkMediaItem: (sub: MediaItemType) => boolean,
    handlers: {
        onItemMouseDown: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            item: MediaItemType,
            side: 'left' | 'right' | 'center'
        ) => void
    },
    amountOfLanes?: number
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
                checkMediaItem={checkMediaItem}
                gridGap={gridGap}
                isPlayedBack={activeItemIndex === index}
                amountOfLanes={amountOfLanes}
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
    checkMediaItem: (sub: MediaItemType) => boolean
    amountOfLanes?: number
}

const MediaItems = ({
    mediaItems,
    renderConfig,
    gridGap,
    currentTime,
    updateMediaItem,
    checkMediaItem,
    amountOfLanes,
}: Props) => {
    const $mediaItemsRef: React.RefObject<HTMLDivElement> = useRef(null)
    const { onItemMouseDown } = useItemInteraction(mediaItems, renderConfig, gridGap, $mediaItemsRef, updateMediaItem)
    const activeItemIndex = mediaItems.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime)

    return (
        <div className="video-editor__media-items">
            <div ref={$mediaItemsRef}>
                {renderItems(
                    mediaItems,
                    renderConfig,
                    gridGap,
                    activeItemIndex,
                    checkMediaItem,
                    {
                        onItemMouseDown,
                    },
                    amountOfLanes
                )}
            </div>
        </div>
    )
}

export default React.memo(MediaItems)
