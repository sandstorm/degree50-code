import React, { useCallback } from 'react'
import { MediaItem as MediaItemType } from '../../types'
import { RenderConfig } from '../MediaTrack'

type Props = {
    item: MediaItemType
    id: number
    renderConfig: RenderConfig
    isPlayedBack?: boolean
    checkMediaItem: (sub: MediaItemType) => boolean
    gridGap: number
    onItemMouseDown: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        item: MediaItemType,
        side: 'left' | 'right' | 'center'
    ) => void
    amountOfLanes?: number
}

const MediaItem = ({
    item,
    id,
    renderConfig,
    checkMediaItem,
    gridGap,
    onItemMouseDown,
    isPlayedBack,
    amountOfLanes = 0,
}: Props) => {
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

    const mediaItemHeight = 100 / (amountOfLanes + 1)

    return (
        <div
            className={[
                'video-editor__media-items__item',
                isPlayedBack ? 'video-editor__media-items__item--highlight' : '',
                checkMediaItem(item) ? 'video-editor__media-items__item--illegal' : '',
            ]
                .join(' ')
                .trim()}
            key={id}
            style={{
                backgroundColor: item.color ? item.color : '',
                left: renderConfig.padding * gridGap + (item.startTime - renderConfig.timelineStartTime) * gridGap * 10,
                width: (item.endTime - item.startTime) * gridGap * 10,
                top: item.lane * mediaItemHeight + '%',
                height: mediaItemHeight + '%',
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
            />
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
            />
        </div>
    )
}

export default React.memo(MediaItem)
