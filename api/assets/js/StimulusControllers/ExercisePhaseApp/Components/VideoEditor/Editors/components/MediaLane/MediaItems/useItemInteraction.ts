import React, { useState, useCallback, useEffect } from 'react'
import { d2t } from 'duration-time-conversion'
import { MediaItem } from '../../types'
import { RenderConfig } from '../MediaTrack'
import { itemIsVisible } from './helpers'

const getVisibleItems = (items: MediaItem[], timelineStartTime: number, duration: number): MediaItem[] => {
    return items.filter((item) => itemIsVisible(item, timelineStartTime, duration))
}

export const useItemInteraction = (
    mediaItems: MediaItem[],
    renderConfig: RenderConfig,
    gridGap: number,
    $mediaItemsRef: React.RefObject<HTMLDivElement>,
    updateMediaItem: (item: MediaItem, updatedValues: { start?: string; end?: string }, newStartTime: number) => void
) => {
    const [isDraging, setIsDraging] = useState(false)
    const [lastClickedItem, setLastClickedItem] = useState<MediaItem | undefined>(undefined)
    const [lastClickedItemIndex, setLastClickedItemIndex] = useState<number>(0)
    const [lastClickedItemSide, setLastClickedItemSide] = useState('center')
    const [lastTargetNode, setLastTargetNode] = useState<HTMLElement | undefined>(undefined)
    const [lastTargetNodeWidth, setLastTargetNodeWidth] = useState<number>(0)
    const [lastPageX, setLastPageX] = useState<number>(0)
    const [lastDiffX, setLastDiffX] = useState<number>(0)

    const onItemMouseDown = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: MediaItem, side: 'left' | 'center' | 'right') => {
            setIsDraging(true)
            setLastClickedItem(item)
            setLastClickedItemSide(side)
            setLastPageX(event.pageX)

            const currentlyVisibleItems = getVisibleItems(
                mediaItems,
                renderConfig.timelineStartTime,
                renderConfig.duration
            )

            const itemIndex = currentlyVisibleItems.indexOf(item)

            setLastClickedItemIndex(itemIndex)

            const $mediaItemsWrapper = $mediaItemsRef.current

            if ($mediaItemsWrapper) {
                const targetNode = $mediaItemsWrapper.children[itemIndex] as HTMLElement

                setLastTargetNode(targetNode)
                setLastTargetNodeWidth(parseFloat(targetNode.style.width))
            }
        },
        [
            setIsDraging,
            setLastClickedItem,
            setLastClickedItemSide,
            setLastClickedItemIndex,
            setLastPageX,
            setLastTargetNode,
            setLastTargetNodeWidth,
            mediaItems,
            $mediaItemsRef,
        ]
    )

    const onMouseMove = useCallback(
        (event) => {
            if (isDraging && lastTargetNode) {
                const lastDiffX = event.pageX - lastPageX
                setLastDiffX(lastDiffX)

                if (lastClickedItemSide === 'left') {
                    lastTargetNode.style.width = `${lastTargetNodeWidth - lastDiffX}px`
                    lastTargetNode.style.transform = `translate(${lastDiffX}px)`
                } else if (lastClickedItemSide === 'right') {
                    lastTargetNode.style.width = `${lastTargetNodeWidth + lastDiffX}px`
                } else {
                    lastTargetNode.style.transform = `translate(${lastDiffX}px)`
                }
            }
        },
        [isDraging, lastTargetNode, lastPageX, lastClickedItemSide, lastTargetNode, lastTargetNodeWidth, setLastDiffX]
    )

    const onMouseUp = useCallback(() => {
        if (isDraging && lastTargetNode && lastDiffX && lastClickedItem) {
            const timeDiff = lastDiffX / gridGap / 10
            const previousItem = mediaItems[lastClickedItemIndex - 1]
            const nextItem = mediaItems[lastClickedItemIndex + 1]
            const newStartTime = (lastClickedItem.startTime || 0) + timeDiff
            const newEndTime = (lastClickedItem.endTime || 0) + timeDiff

            if (lastClickedItemSide === 'left') {
                if (newStartTime >= 0 && newStartTime < (lastClickedItem.endTime || 0)) {
                    const start = d2t(newStartTime.toFixed(3))

                    updateMediaItem(lastClickedItem, { start }, newStartTime)
                } else {
                    lastTargetNode.style.width = `${lastTargetNodeWidth}px`
                }
            } else if (lastClickedItemSide === 'right') {
                if (newEndTime >= 0 && newEndTime > (lastClickedItem?.startTime || 0)) {
                    const end = d2t(newEndTime.toFixed(3))
                    updateMediaItem(lastClickedItem, { end }, newStartTime)
                } else {
                    lastTargetNode.style.width = `${lastTargetNodeWidth}px`
                }
            } else {
                if (newStartTime > 0 && newEndTime > 0 && newEndTime > newStartTime) {
                    const start = d2t(newStartTime.toFixed(3))
                    const end = d2t(newEndTime.toFixed(3))

                    updateMediaItem(
                        lastClickedItem,
                        {
                            start,
                            end,
                        },
                        newStartTime
                    )
                } else {
                    lastTargetNode.style.width = `${lastTargetNodeWidth}px`
                }
            }

            lastTargetNode.style.transform = `translate(0)`
        }

        setLastClickedItemSide('center')
        setLastPageX(0)
        setLastDiffX(0)
        setIsDraging(false)
        setLastClickedItem(undefined)
        setLastClickedItemIndex(0)
        setLastTargetNode(undefined)
        setLastTargetNodeWidth(0)
    }, [
        gridGap,
        isDraging,
        mediaItems,
        updateMediaItem,
        lastTargetNode,
        lastDiffX,
        lastClickedItem,
        lastClickedItemIndex,
        lastTargetNodeWidth,
        setLastClickedItemSide,
        setLastPageX,
        setLastDiffX,
        setIsDraging,
        setLastClickedItem,
        setLastClickedItemIndex,
        setLastTargetNode,
        setLastTargetNodeWidth,
    ])

    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [onMouseMove, onMouseUp])

    return {
        onItemMouseDown,
    }
}
