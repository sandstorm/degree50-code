import React, { useCallback, useState } from 'react'
import { connect } from 'react-redux'
import { MediaItem as MediaItemClass } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { actions } from '../../../../PlayerSlice'
import MediaItemContextMenu from './MediaItemContextMenu'
import MediaItemMemoForm from './MediaItemMemoForm'
import { useModal } from 'Components/Modal/useModal'
import Button from 'Components/Button/Button'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'
import { Handle } from './types'

type OwnProps = {
    item: MediaItemClass<MediaItemType>
    id: number
    renderConfig: RenderConfig
    isPlayedBack?: boolean
    checkMediaItem: (item: MediaItemClass<any>) => boolean
    onItemMouseDown: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        item: MediaItemClass<MediaItemType>,
        side: Handle
    ) => void
    removeMediaItem: (item: MediaItemClass<MediaItemType>) => void
    updateMediaItem: (
        item: MediaItemClass<MediaItemType>,
        updatedValues: { start?: string; end?: string; memo?: string },
        newStartTime: number
    ) => void
    amountOfLanes?: number
    showTextInMediaItems: boolean
}

const mapStateToProps = (state: {}) => {
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
    onItemMouseDown,
    isPlayedBack,
    removeMediaItem,
    updateMediaItem,
    amountOfLanes = 0,
    showTextInMediaItems = true,
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
    const [contextMenuPosX, setContextMenuPosX] = useState(0)
    const [contextMenuPosY, setContextMenuPosY] = useState(0)

    const submitMemo = (memo: string) => {
        updateMediaItem(item, { memo: memo }, item.startTime)
        closeMemoEditModal()
    }

    const updateContextMenuIsVisible = useCallback(
        (isVisible: boolean) => {
            setContextMenuIsVisible(isVisible)
        },
        [setContextMenuIsVisible]
    )

    const positionLeft =
        renderConfig.padding * renderConfig.gridGap +
        (item.startTime - renderConfig.timelineStartTime) * renderConfig.gridGap * 10

    const { showModal: showMemoModal, RenderModal: RenderMemoModal } = useModal()
    const { showModal: showMemoEditModal, hideModal: closeMemoEditModal, RenderModal: RenderMemoEditModal } = useModal()

    const contentMenuItemHeight = 30

    // Used for video-codes
    const getShortCodeForItemLabel = (title: string) => {
        const splitStr = title.toLowerCase().split(' ')
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase()
        }
        return splitStr.join('')
    }

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
            title={item.text}
            style={{
                backgroundColor: item.color ? item.color : '',
                left: positionLeft,
                width: (item.endTime - item.startTime) * renderConfig.gridGap * 10,
                top: item.lane * mediaItemHeight + '%',
                height: mediaItemHeight + '%',
            }}
            onClick={() => {
                setPause(true)
                setPlayPosition(item.startTime + 0.001)
            }}
            onContextMenu={(event) => {
                event.preventDefault()
                setPause(true)
                setPlayPosition(item.startTime + 0.001)

                updateContextMenuIsVisible(true)
                setContextMenuPosX(event.pageX)
                const mediaItemsHeight = document.getElementsByClassName('video-editor__media-items')[0].clientHeight
                const phaseHeight = document.getElementsByClassName('exercise-phase__inner')[0].clientHeight
                let posY = mediaItemsHeight - (phaseHeight - event.pageY)
                if (posY >= mediaItemsHeight / 2) {
                    posY = posY - 3 * contentMenuItemHeight
                }
                setContextMenuPosY(posY)
            }}
        >
            {item.memo ? (
                <Button onPress={showMemoModal} className={'video-editor__media-items__memo-toggle'}>
                    <i className={'fas fa-info'} />
                </Button>
            ) : null}
            <div
                className="video-editor__media-item__handle"
                style={{
                    left: 0,
                    width: renderConfig.gridGap,
                }}
                onMouseDown={handleLeftHandleMouseDown}
            />

            <div className="video-editor__media-items__text" onMouseDown={handleItemCenterMouseDown}>
                {showTextInMediaItems
                    ? item.text.split(/\r?\n/).map((line: any, index: any /* FIXME any */) => <p key={index}>{line}</p>)
                    : getShortCodeForItemLabel(item.text)}
            </div>

            <div
                className="video-editor__media-item__handle"
                style={{
                    right: 0,
                    width: renderConfig.gridGap,
                }}
                onMouseDown={handleRightHandleMouseDown}
            />
            <MediaItemContextMenu
                removeMediaItem={() => {
                    removeMediaItem(item)
                }}
                addMemoToMediaItem={() => {
                    showMemoEditModal()
                }}
                contextMenuIsVisible={contextMenuIsVisible}
                posX={contextMenuPosX}
                posY={contextMenuPosY}
                handleClose={() => {
                    updateContextMenuIsVisible(false)
                }}
            />
            <RenderMemoModal title={'Memo'}>{item.memo}</RenderMemoModal>
            <RenderMemoEditModal title={'Memo bearbeiten'}>
                <MediaItemMemoForm currentMemo={item.memo} submitMemo={submitMemo} />
            </RenderMemoEditModal>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(MediaItem))
