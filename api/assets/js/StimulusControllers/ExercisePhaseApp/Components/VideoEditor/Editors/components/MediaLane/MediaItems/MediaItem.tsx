import React, { useCallback } from 'react'
import { MediaItem as MediaItemType } from '../../types'
import { RenderConfig } from '../MediaTrack'

type Props = {
    item: MediaItemType
    id: number
    renderConfig: RenderConfig
    gridGap: number
    onItemMouseDown: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        item: MediaItemType,
        side: 'left' | 'right' | 'center'
    ) => void
}

const MediaItem = ({ item, id, renderConfig, gridGap, onItemMouseDown }: Props) => {
    const handleLeftHandleMouseDown = useCallback(
        (event) => {
            onItemMouseDown(event, item, 'left')
        },
        [item, onItemMouseDown]
    )

    const handleRightHandleMouseDown = useCallback(
        (event) => {
            onItemMouseDown(event, item, 'right')
        },
        [item, onItemMouseDown]
    )

    const handleItemCenterMouseDown = useCallback(
        (event) => {
            onItemMouseDown(event, item, 'center')
        },
        [item, onItemMouseDown]
    )

    return (
        <div
            className={['video-editor__media-items__item'].join(' ').trim()}
            key={id}
            style={{
                backgroundColor: item.color ? item.color : '',
                left: renderConfig.padding * gridGap + (item.startTime - renderConfig.timelineStartTime) * gridGap * 10,
                width: (item.endTime - item.startTime) * gridGap * 10,
            }}
            onClick={() => {
                // TODO
            }}
            onContextMenu={() => {
                // TODO
            }}
        >
            <div
                className="video-editor__media-items__handle"
                style={{
                    left: 0,
                    width: gridGap,
                }}
                onMouseDown={handleLeftHandleMouseDown}
            ></div>
            <div className="video-editor__media-items__text" onMouseDown={handleItemCenterMouseDown}>
                {item.text.split(/\r?\n/).map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
            <div
                className="video-editor__media-items__handle"
                style={{
                    right: 0,
                    width: gridGap,
                }}
                onMouseDown={handleRightHandleMouseDown}
            ></div>
        </div>
    )
}

export default React.memo(MediaItem)
