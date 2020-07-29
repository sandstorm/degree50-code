import React, { useRef } from 'react'
import ReadOnlyMediaItem from './ReadOnlyMediaItem'
import { MediaItem as MediaItemType } from '../../types'
import { RenderConfig } from '../ReadOnlyMediaTrack'

const renderItems = (mediaItems: MediaItemType[], renderConfig: RenderConfig, gridGap: number) =>
    mediaItems.map((item, index) => {
        return <ReadOnlyMediaItem key={index} id={index} item={item} renderConfig={renderConfig} gridGap={gridGap} />
    })

type Props = {
    mediaItems: MediaItemType[]
    renderConfig: RenderConfig
    gridGap: number
}

const ReadOnlyMediaItems = ({ mediaItems, renderConfig, gridGap }: Props) => {
    const $mediaItemsRef: React.RefObject<HTMLDivElement> = useRef(null)

    return (
        <div className="video-editor__media-items">
            <div ref={$mediaItemsRef}>{renderItems(mediaItems, renderConfig, gridGap)}</div>
        </div>
    )
}

export default React.memo(ReadOnlyMediaItems)
