import React from 'react'
import { MediaItem as MediaItemType } from '../../types'
import { RenderConfig } from '../../MediaLane/MediaTrack'

type Props = {
    item: MediaItemType
    id: number
    renderConfig: RenderConfig
    gridGap: number
}

const ReadOnlyMediaItem = ({ item, id, renderConfig, gridGap }: Props) => {
    return (
        <div
            className={['video-editor__media-items__item'].join(' ').trim()}
            key={id}
            style={{
                backgroundColor: item.color ? item.color : '',
                left: renderConfig.padding * gridGap + (item.startTime - renderConfig.timelineStartTime) * gridGap * 10,
                width: (item.endTime - item.startTime) * gridGap * 10,
            }}
        >
            <div className="video-editor__media-items__text">
                {item.text.split(/\r?\n/).map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
    )
}

export default React.memo(ReadOnlyMediaItem)
