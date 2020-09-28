import React, { useRef } from 'react'
import ReadOnlyMediaItem from './ReadOnlyMediaItem'
import { MediaItem } from '../../types'
import { RenderConfig } from '../../MediaLane/MediaTrack'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'

const renderItems = (
    mediaItems: MediaItem<MediaItemType>[],
    renderConfig: RenderConfig,
    amountOfLanes: number,
    showTextInMediaItems: boolean
) =>
    mediaItems.map((item, index) => {
        return (
            <ReadOnlyMediaItem
                key={index}
                id={index}
                item={item}
                renderConfig={renderConfig}
                amountOfLanes={amountOfLanes}
                showTextInMediaItems={showTextInMediaItems}
            />
        )
    })

type Props = {
    mediaItems: MediaItem<MediaItemType>[]
    renderConfig: RenderConfig
    amountOfLanes: number
    showTextInMediaItems: boolean
    height: number
}

const ReadOnlyMediaItems = ({ mediaItems, renderConfig, amountOfLanes, showTextInMediaItems, height }: Props) => {
    return (
        <div className="video-editor__media-items" style={{ height: height }}>
            {renderItems(mediaItems, renderConfig, amountOfLanes, showTextInMediaItems)}
        </div>
    )
}

export default React.memo(ReadOnlyMediaItems)
