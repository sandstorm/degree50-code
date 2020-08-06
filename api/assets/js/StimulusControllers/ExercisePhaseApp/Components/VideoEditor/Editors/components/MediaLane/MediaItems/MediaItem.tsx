import React, { useCallback, useState } from 'react'
import { connect } from 'react-redux'
import { MediaItem as MediaItemClass } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { MediaItemType } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'
import { actions } from '../../../../PlayerSlice'
import { AppState } from '../../../../../../Store/Store'
import MediaItemContextMenu from './MediaItemContextMenu'

type OwnProps = {
    item: MediaItemClass<MediaItemType>
    id: number
    renderConfig: RenderConfig
    isPlayedBack?: boolean
    checkMediaItem: (item: MediaItemClass<any>) => boolean
    gridGap: number
    onItemMouseDown: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        item: MediaItemClass<MediaItemType>,
        side: 'left' | 'right' | 'center'
    ) => void
    removeMediaItem: (item: MediaItemClass<MediaItemType>) => void
    amountOfLanes?: number
}

const mapStateToProps = (state: AppState) => {
    return {}
}

const mapDispatchToProps = {
    setPause: actions.setPause,
    setPlayPosition: actions.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const MediaItem = ({
    item,
    id,
    renderConfig,
    checkMediaItem,
    gridGap,
    onItemMouseDown,
    isPlayedBack,
    removeMediaItem,
    amountOfLanes = 0,
    setPause,
    setPlayPosition,
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

    const [contextMenuIsVisible, setContextMenuIsVisible] = useState(false)

    const updateContextMenuIsVisible = useCallback(
        (isVisible: boolean) => {
            setContextMenuIsVisible(isVisible)
        },
        [setContextMenuIsVisible]
    )

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
                setPause(true)
                setPlayPosition(item.startTime + 0.001)
            }}
            onContextMenu={(event) => {
                event.preventDefault()
                updateContextMenuIsVisible(true)
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
                {item.text.split(/\r?\n/).map((line: any, index: any /* FIXME any */) => (
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
            <MediaItemContextMenu
                removeMediaItem={() => {
                    removeMediaItem(item)
                }}
                contextMenuIsVisible={contextMenuIsVisible}
                handleClose={() => {
                    updateContextMenuIsVisible(false)
                }}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MediaItem))
