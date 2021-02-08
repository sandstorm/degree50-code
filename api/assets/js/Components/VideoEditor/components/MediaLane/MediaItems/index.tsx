import React, { useRef } from 'react'
import MediaItem from './MediaItem'
import { MediaItem as MediaItemClass, MediaItemType } from '../../../types'
import { RenderConfig } from '../MediaTrack'
import { useItemInteraction } from './useItemInteraction'
import { itemIsVisible } from './helpers'

const renderItems = (
    mediaItems: MediaItemClass<MediaItemType>[],
    renderConfig: RenderConfig,
    activeItemIndex: number,
    checkMediaItem: (item: MediaItemClass<any>) => boolean,
    handlers: {
        onItemMouseDown: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            item: MediaItemClass<MediaItemType>,
            side: 'left' | 'right' | 'center'
        ) => void
    },
    removeMediaItem: (id: string) => void,
    updateMediaItem: (
        item: MediaItemClass<MediaItemType>,
        updatedValues: { start?: string; end?: string; memo?: string },
        newStartTime: number
    ) => void,
    showTextInMediaItems: boolean,
    amountOfLanes?: number
) =>
    mediaItems.map((item, index) => {
        if (!itemIsVisible(item, renderConfig.timelineStartTime, renderConfig.duration)) {
            return null
        }

        return (
            <MediaItem
                key={index}
                id={item.originalData?.id ?? index}
                item={item}
                renderConfig={renderConfig}
                checkMediaItem={checkMediaItem}
                isPlayedBack={activeItemIndex === index}
                amountOfLanes={amountOfLanes}
                removeMediaItem={removeMediaItem}
                updateMediaItem={updateMediaItem}
                showTextInMediaItems={showTextInMediaItems}
                {...handlers}
            />
        )
    })

type Props = {
    mediaItems: MediaItemClass<MediaItemType>[]
    renderConfig: RenderConfig
    currentTime: number
    updateMediaItem: (
        item: MediaItemClass<MediaItemType>,
        updatedValues: { start?: string; end?: string; memo?: string },
        newStartTime: number
    ) => void
    removeMediaItem: (id: string) => void
    checkMediaItem: (item: MediaItemClass<MediaItemType>) => boolean
    showTextInMediaItems: boolean
    height: number
    amountOfLanes?: number
}

const MediaItems = ({
    mediaItems,
    renderConfig,
    currentTime,
    updateMediaItem,
    removeMediaItem,
    checkMediaItem,
    showTextInMediaItems,
    amountOfLanes,
}: Props) => {
    const $mediaItemsRef: React.RefObject<HTMLDivElement> = useRef(null)
    const { onItemMouseDown } = useItemInteraction(mediaItems, renderConfig, $mediaItemsRef, updateMediaItem)
    const activeItemIndex = mediaItems.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime)

    return (
        <div className="video-editor__media-items">
            <div ref={$mediaItemsRef}>
                {renderItems(
                    mediaItems,
                    renderConfig,
                    activeItemIndex,
                    checkMediaItem,
                    {
                        onItemMouseDown,
                    },
                    removeMediaItem,
                    updateMediaItem,
                    showTextInMediaItems,
                    amountOfLanes
                )}
            </div>
            <div id={'media-item-context-menu'} />
        </div>
    )
}

export default React.memo(MediaItems)
