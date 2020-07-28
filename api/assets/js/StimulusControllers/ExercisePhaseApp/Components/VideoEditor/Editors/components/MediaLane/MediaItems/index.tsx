import React, { useRef } from 'react'
import MediaItem from './MediaItem'
import { MediaItem as MediaItemType } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { useItemInteraction } from './useItemInteraction'

const renderItems = (
    mediaItems: MediaItemType[],
    renderConfig: RenderConfig,
    gridGap: number,
    handlers: {
        onItemMouseDown: (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            item: MediaItemType,
            side: 'left' | 'right' | 'center'
        ) => void
    }
) =>
    mediaItems.map((item, index) => {
        return (
            <MediaItem key={index} id={index} item={item} renderConfig={renderConfig} gridGap={gridGap} {...handlers} />
        )
    })

type Props = {
    mediaItems: MediaItemType[]
    renderConfig: RenderConfig
    gridGap: number
    updateMediaItem: (
        item: MediaItemType,
        updatedValues: { start?: string; end?: string },
        newStartTime: number
    ) => void
}

const MediaItems = ({ mediaItems, renderConfig, gridGap, updateMediaItem }: Props) => {
    const $mediaItemsRef: React.RefObject<HTMLDivElement> = useRef(null)
    const { onItemMouseDown } = useItemInteraction(mediaItems, renderConfig, gridGap, $mediaItemsRef, updateMediaItem)

    return (
        <div className="video-editor__media-items">
            <div ref={$mediaItemsRef}>
                {renderItems(mediaItems, renderConfig, gridGap, {
                    onItemMouseDown,
                })}
            </div>
        </div>
    )
}

export default React.memo(MediaItems)
