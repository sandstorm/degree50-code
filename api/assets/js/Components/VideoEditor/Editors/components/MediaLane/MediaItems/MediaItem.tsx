import React, { useCallback, useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import { MediaItem as MediaItemClass } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { actions } from '../../../../PlayerSlice'
import MediaItemContextMenu from './MediaItemContextMenu'
import MediaItemMemoForm from './MediaItemMemoForm'
import { useModalHook } from 'Components/Modal/useModalHook'
import Button from 'Components/Button/Button'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'
import { Handle } from './types'
import MediaItemLabel from './MediaItemLabel'
import { clamp, getContextYPosition } from './helpers'

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

const mapDispatchToProps = {
    setPause: actions.setPause,
    setPlayPosition: actions.setPlayPosition,
}

type Props = typeof mapDispatchToProps & OwnProps

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
    const itemRef = useRef<HTMLDivElement>(null)

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

    const { showModal: showMemoModal, RenderModal: RenderMemoModal } = useModalHook()
    const {
        showModal: showMemoEditModal,
        hideModal: closeMemoEditModal,
        RenderModal: RenderMemoEditModal,
    } = useModalHook()

    const contentMenuItemHeight = 30

    const width = (item.endTime - item.startTime) * renderConfig.gridGap * 10

    // WHY:
    // This is a hack to make sure, that media items will always reflect the correct width if either their
    // DOM node or the item changes. This means, that even if just some part of item.originalData
    //  (e.g. the offset on a cutList item) has been changed, the width will be explicitly set to the DOM node.
    // This is necessary, because our useItemInteraction() hook directly messes with the DOM nodes of media items and
    // updating the width of the react virtual dom node wont take effect after some renders otherwise.
    //
    // This helps preventing bugs like this: https://gitlab.sandstorm.de/degree-4.0/code/-/issues/59
    useEffect(() => {
        if (itemRef.current) {
            // eslint-disable-next-line
            itemRef.current.style.width = `${width}px`
        }
    }, [itemRef, item])

    // WHY: Clamp width of lane item drag handle between min and max value
    const laneItemHandleWidth = clamp(renderConfig.gridGap, 8, 12)

    return (
        <div
            ref={itemRef}
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
                width,
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

                const posY = getContextYPosition({
                    mediaItemsHeight,
                    phaseHeight,
                    pageY: event.pageY,
                    contentMenuItemHeight,
                })

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
                    width: laneItemHandleWidth,
                }}
                onMouseDown={handleLeftHandleMouseDown}
            />

            <div className="video-editor__media-items__text" onMouseDown={handleItemCenterMouseDown}>
                <MediaItemLabel item={item} showTextInMediaItems={showTextInMediaItems} />
            </div>

            <div
                className="video-editor__media-item__handle"
                style={{
                    right: 0,
                    width: laneItemHandleWidth,
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

export default connect(undefined, mapDispatchToProps)(React.memo(MediaItem))
