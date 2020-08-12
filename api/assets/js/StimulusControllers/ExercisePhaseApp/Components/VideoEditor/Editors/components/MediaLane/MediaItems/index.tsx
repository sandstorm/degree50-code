import React, { useRef } from 'react'
import MediaItem from './MediaItem'
import { MediaItem as MediaItemClass } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { useItemInteraction } from './useItemInteraction'
import { itemIsVisible } from './helpers'
import { MediaItemType } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'

const renderItems = (
    mediaItems: MediaItemClass<MediaItemType>[],
    renderConfig: RenderConfig,
    gridGap: number,
    activeItemIndex: number,
    checkMediaItem: (item: MediaItemClass<any>) => boolean,
    handlers: {
        onItemMouseDown: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            item: MediaItemClass<MediaItemType>,
            side: 'left' | 'right' | 'center'
        ) => void
    },
    removeMediaItem: (item: MediaItemClass<MediaItemType>) => void,
    amountOfLanes?: number
) =>
    mediaItems.map((item, index) => {
        if (!itemIsVisible(item, renderConfig.timelineStartTime)) {
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
                removeMediaItem={removeMediaItem}
                {...handlers}
            />
        )
    })

type Props = {
    mediaItems: MediaItemClass<MediaItemType>[]
    renderConfig: RenderConfig
    gridGap: number
    currentTime: number
    updateMediaItem: (
        item: MediaItemClass<MediaItemType>,
        updatedValues: { start?: string; end?: string },
        newStartTime: number
    ) => void
    removeMediaItem: (item: MediaItemClass<MediaItemType>) => void
    checkMediaItem: (item: MediaItemClass<MediaItemType>) => boolean
    amountOfLanes?: number
}

const MediaItems = ({
    mediaItems,
    renderConfig,
    gridGap,
    currentTime,
    updateMediaItem,
    removeMediaItem,
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
                    removeMediaItem,
                    amountOfLanes
                )}
            </div>
        </div>
    )
}

export default React.memo(MediaItems)
