import { RefObject, useState, useCallback } from 'react'
import VideoContext from 'videocontext'
import { t } from 'react-i18nify'
import { d2t, t2d } from 'duration-time-conversion'

import { Cut } from './types'
import { MediaItem } from '../components/types'
import { notify } from '../utils'
import { useMediaItemHandling } from '../utils/hooks'
import Storage from '../utils/storage'
import { hasConflictWithItem } from '../components/MediaLane/MediaItems/helpers'
import { selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'

export const useVolume = () => {
    const [volume, setVolume] = useState<number>(0)

    const handleVolumeChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setVolume(parseInt(event.currentTarget.value) / 10)
        },
        [setVolume]
    )

    return { volume, handleVolumeChange }
}

/**
 * Specialized media item handling for cuts.
 */
export const useCuttingMediaItemHandling = ({
    mediaItems,
    setCutList,
    updateCallback,
    storage,
    playerSyncPlayPosition,
    setPlayPosition,
    updateCondition,
}: {
    mediaItems: Array<MediaItem<Cut>>
    setCutList: (mediaItems: Array<Cut>) => void
    updateCallback: Function
    storage?: Storage
    playerSyncPlayPosition: ReturnType<typeof selectors.player.selectSyncPlayPosition>
    setPlayPosition: typeof actions.player.setPlayPosition
    updateCondition: boolean
}) => {
    const {
        currentIndex,

        setCurrentTimeForMediaItems,
        removeMediaItem,
        updateMediaItems: updateMediaItemsOriginal,
        checkMediaItem,
        hasMediaItem,
        copyMediaItems,
    } = useMediaItemHandling<Cut>({
        updateCondition,
        mediaItems,
        setMediaItems: setCutList,
        updateCallback,
        storage,
    })

    const updateMediaItems = (items: Array<MediaItem<Cut>>, saveToHistory = true, force = false) => {
        const withResolvedOverlapAndSnap = resolveOverlapAndSnapItems(items)
        updateMediaItemsOriginal(withResolvedOverlapAndSnap, saveToHistory, force)
    }

    /**
     * Handles the update of Cut media items and makes sure that their offset is handled correctly
     */
    const updateMediaItem = useCallback(
        (item: MediaItem<Cut>, updatedValues: { start?: string; end?: string }) => {
            const index = hasMediaItem(item)

            if (index < 0) return

            const copiedItems = copyMediaItems()
            const { clone } = item

            const { start: updatedStart, end: updatedEnd } = updatedValues
            const newStart = updatedStart || item.start
            const newEnd = updatedEnd || item.end

            const duration = t2d(newEnd) - t2d(newStart)

            // Make sure that the clip will
            // a) always be at least on second long
            // b) always have an exact second count (e.g. not 1 second + 20 frames)
            //
            // WHY: The serverside rendering of the cutlist will always be full seconds
            // and its result might otherwise deviate from the representation inside the frontend.
            const adjustedDuration = Math.round(duration) < 1 ? 1 : Math.round(duration)
            const adjustedEnd = d2t((t2d(newStart) + adjustedDuration).toFixed(3))

            const newValues = {
                ...updatedValues,
                // NOTE: It's important that we DO NOT use the adjustedEnd value here, to correctly determine
                // what item handle was used to change the item.
                originalData: updatedValues.start
                    ? {
                          ...item.originalData,
                          offset: updateOffset(item, newStart, updatedValues?.end),
                      }
                    : item.originalData,
                start: newStart,
                // Add a frame to our adjustedEnd if it does not differ from our input
                //
                // WHY:
                // This is a hack to ensure that the item changes at least a bit after rounding.
                // That way we can rely on components which receive these items as props to re-render.
                // This is necessary, because some of our components have some form of inner mutation/DOM manipulation. E.g. our useItemInteraction() hook directly interacts with the DOM.
                // When an item is changed the change is reflected immediately in the DOM (e.g. when the width of a node is written), but might actually get nullified by our rounding in here.
                // Because of the rounding our input item might then be exactly the same as before, which would lead to no update in our store and therefore no re-render of the components. (so we would have a state mismatch between our actual list of items and the rendered items)
                // It would probably be better to find a way to make item interaction etc. to be controlled components instead or work with some form of intermediate data structure which can be reset.
                end: adjustedEnd === item.end ? d2t((t2d(adjustedEnd) + 0.01).toFixed(3)) : adjustedEnd,
            }

            Object.assign(clone, newValues)

            if (clone.check) {
                copiedItems[index] = clone
                updateMediaItems(copiedItems)
            } else {
                notify(t('parameter-error'), 'error')
            }
        },
        [hasMediaItem, copyMediaItems, updateMediaItems]
    )

    /**
     * Splits the item below the cursor, setting a new end time for the original item
     * as well as setting the corresponding start and offset values on the newly created cut.
     */
    const handleSplitAtCursor = () => {
        const activeItemIndex = mediaItems.findIndex(
            (item) => item.startTime <= playerSyncPlayPosition && item.endTime > playerSyncPlayPosition
        )

        if (activeItemIndex > -1) {
            const item = mediaItems[activeItemIndex]

            const leftNode = new MediaItem<Cut>({
                ...item,
                end: d2t(playerSyncPlayPosition.toFixed(3)),
                originalData: {
                    ...item.originalData,
                },
            })

            const rightNode = new MediaItem<Cut>({
                ...item,
                start: d2t((leftNode.endTime + 0.01).toFixed(3)),
                originalData: {
                    ...item.originalData,
                    offset: item.originalData.offset + (leftNode.endTime - leftNode.startTime),
                },
            })

            updateMediaItems([
                ...mediaItems.slice(0, activeItemIndex),
                leftNode,
                rightNode,
                ...mediaItems.slice(activeItemIndex + 1),
            ])
        }
    }

    /**
     * Duplicates the cut at a certain index from the cutlist
     */
    const duplicateCut = useCallback(
        (index) => {
            const cuts = copyMediaItems()

            const cutToCopy = cuts[index]

            const startTime = (cutToCopy.endTime + 0.01).toFixed(3)
            const endTime = (cutToCopy.endTime + (cutToCopy.endTime - cutToCopy.startTime)).toFixed(3)

            const newCut = new MediaItem<Cut>({
                start: d2t(startTime),
                end: d2t(endTime),
                text: cutToCopy.text,
                color: cutToCopy.color,
                memo: cutToCopy.memo,
                originalData: cutToCopy.originalData,
                lane: 0,
            })

            setPlayPosition(t2d(newCut.start))

            const updatedCuts = [...cuts.slice(0, index), cutToCopy, newCut, ...cuts.slice(index + 1)]
            updateMediaItems(updatedCuts)
        },
        [copyMediaItems, updateMediaItems]
    )

    return {
        currentIndex,

        checkMediaItem,
        copyMediaItems,
        duplicateCut,
        handleSplitAtCursor,
        hasMediaItem,
        removeMediaItem,
        setCurrentTimeForMediaItems,
        updateMediaItem,
        updateMediaItems,
    }
}

/**
 * Sorts media items by their startTime, resolves overlaps between items and also
 * removes blank space between items.
 *
 * HOW:
 * How the overlap between two items is resolved, depends on the relative positioning of the items to each other.
 * If the right overlapping items start is closer to the left items start than to the left items end, it
 * will swap places with the left item. Otherwise the right item will snap to the end of the left item:
 *
 * Case A:
 *  [--- ItemA ---]
 *    [--- ItemB ---]
 *  ===> results in: [--- ItemB ---][--- ItemA ---]
 *
 * Case B:
 *  [--- ItemA ---]
 *           [--- ItemB ---]
 *  ===> results in: [--- ItemA ---][--- ItemB ---]
 *
 * This function assumes that there will always be one overlap at max (because the user can't do more than one change
 * at a time) and therefore snaps all items, which come after the resolved overlap to their predecessors endTime.
 */
export const resolveOverlapAndSnapItems = (items: MediaItem<Cut>[]): MediaItem<Cut>[] => {
    const sortedItems = sortItemsByStartTime(items)

    const resolvedItems = sortedItems.reduce((acc, item, index) => {
        const nextItems = acc.slice(index + 1)

        if (nextItems.length < 1) {
            return acc
        }

        const earliestOverlappingItem = nextItems.find((nextItem) => hasConflictWithItem(nextItem, item))

        if (!earliestOverlappingItem) {
            return acc
        }

        const overlapsInFirstHalfOfCurrentItem =
            earliestOverlappingItem.startTime - item.startTime < item.endTime - earliestOverlappingItem.startTime

        // Position either at start of current item or immediately behind current item
        const newOverlappingItemStartTime = overlapsInFirstHalfOfCurrentItem
            ? item.start
            : d2t((item.endTime + 0.01).toFixed(3))

        const updatedOverlappingItem = Object.assign(earliestOverlappingItem.clone, {
            ...earliestOverlappingItem,
            start: newOverlappingItemStartTime,
            end: d2t((t2d(newOverlappingItemStartTime) + parseFloat(earliestOverlappingItem.duration)).toFixed(3)),
        })

        // Either keep position or move directly behind new previous item
        const newItemStartTime = overlapsInFirstHalfOfCurrentItem
            ? d2t((updatedOverlappingItem.endTime + 0.01).toFixed(3))
            : item.start
        const updatedItem = Object.assign(item.clone, {
            ...item,
            start: newItemStartTime,
            end: d2t((t2d(newItemStartTime) + parseFloat(item.duration)).toFixed(3)),
        })

        // Snap all other items into place
        const remainingItems = nextItems.filter((nextItem) => nextItem !== earliestOverlappingItem)
        const firstRemainingItemStartTime =
            updatedOverlappingItem.endTime > updatedItem.endTime
                ? d2t((updatedOverlappingItem.endTime + 0.01).toFixed(3))
                : d2t((updatedItem.endTime + 0.01).toFixed(3))
        const snappedItems = snapItems(remainingItems, firstRemainingItemStartTime)

        return [...acc.slice(0, index), ...sortItemsByStartTime([updatedOverlappingItem, updatedItem]), ...snappedItems]
    }, sortedItems)

    // WHY: Make sure that also possible previously unmodified items are being snapped
    return snapItems(resolvedItems)
}

/**
 * Makes sure that each mediaItem immediately follows its predecessor with almost no
 * blank space between them.
 *
 * WHY: The server side rendered cutlist is currently unable to reflect empty space between media items
 * and concatenates them anyway. By also removing blank space in the frontend, we make sure, that the users
 * expectations are in line with the server side rendered result.
 *
 * NOTE: Because the server does some rounding for start and offset values, the final result
 * might still slightly deviate from the video in the Editor.
 *
 * @returns list - snapped items
 */
export const snapItems = (items: MediaItem<any>[], firstItemStartTime?: string) =>
    items.reduce((acc, item, index) => {
        if (index === 0 && firstItemStartTime) {
            return adjustItemTimelinePositionInList(acc, item, index, firstItemStartTime)
        }

        if (index === 0) {
            return acc
        }

        const previousItem = acc[index - 1]
        const newStartTime = d2t((previousItem.endTime + 0.01).toFixed(3))

        return adjustItemTimelinePositionInList(acc, item, index, newStartTime)
    }, items)

/**
 * Adjusts the start and endtime of a given item and updates it in the context of its surrounding items.
 *
 * @return list of items with the adjusted item at the defined index
 */
export const adjustItemTimelinePositionInList = (
    items: MediaItem<any>[],
    item: MediaItem<any>,
    index: number,
    newStartTime: string
) => [
    ...items.slice(0, index),
    Object.assign(item.clone, {
        ...item,
        start: newStartTime,
        end: d2t((t2d(newStartTime) + parseFloat(item.duration)).toFixed(3)),
    }),
    ...items.slice(index + 1),
]

/**
 * Checks if a media item has been dragged on its left handle (either to the right or the left side).
 * If the handle was dragged left, the offset of the video is reduced (in other words, the video starts earlier).
 * If the handle was dragged right, the offset of the video is increased (the start point inside the video is set to a later point).
 */
export const updateOffset = (oldItem: MediaItem<Cut>, newStartValue: string, newEndValue: string | undefined) => {
    const { startTime } = oldItem
    const newStartTime = t2d(newStartValue)
    const newEndTime = newEndValue ? t2d(newEndValue) : undefined

    const wasDraggedToLeft = startTime > newStartTime && (!newEndTime || newEndTime === oldItem.endTime) // end should not have changed
    const wasDraggedToRight = startTime < newStartTime && (!newEndTime || newEndTime === oldItem.endTime) // end should not have changed

    if (wasDraggedToLeft) {
        const newOffset = oldItem.originalData.offset - (oldItem.startTime - newStartTime)

        return newOffset > 0 ? newOffset : 0
    } else if (wasDraggedToRight) {
        const newOffset = oldItem.originalData.offset + (newStartTime - oldItem.startTime)

        return newOffset
    } else {
        return oldItem.originalData.offset
    }
}

/**
 * Initializes a VideoContext and binds it to a given canvas ref
 *
 * @returns { videoCtx, combineEffect } - returns the created videocontext as well as a combineEffect
 */
export const initVideoContext = (canvasRef: RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current

    const videoCtx = new VideoContext(canvas)
    const combineEffect = videoCtx.compositor(VideoContext.DEFINITIONS.COMBINE)

    // connect all sources
    combineEffect.connect(videoCtx.destination)

    // init timeline
    function render() {
        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)

    return { videoCtx, combineEffect }
}

export const sortItemsByStartTime = (items: MediaItem<any>[]) => {
    return [...items].sort((a, b) => {
        if (a.startsBefore(b)) {
            return 1
        } else if (b.startsBefore(a)) {
            return -1
        } else {
            return 0
        }
    })
}

/**
 * Given a VideoContext and a Cut this directly adds a new videoNode to the context
 */
export const addCut = (cut: Cut, videoCtx: VideoContext) => {
    // We create the video node ourselfs, because we need it asap, to retrieve
    // the aspect ratio of the first video node to determine the dimensions of
    // the canvas it is rendered to.
    const newVideoElement = document.createElement('video')
    newVideoElement.setAttribute('src', cut.url)
    newVideoElement.setAttribute('crossorigin', 'anonymous')
    newVideoElement.setAttribute('webkit-playsinline', '')
    newVideoElement.setAttribute('playsinline', '')
    newVideoElement.setAttribute('data-video', '')

    const videoNode = videoCtx.video(newVideoElement, cut.offset, 4, {
        volume: 0.6,
        loop: false,
    })

    const start = t2d(cut.start)
    const duration = t2d(cut.end) - t2d(cut.start)

    videoNode._playbackRate = cut.playbackRate
    videoNode.start(start)
    videoNode.stop(start + duration)

    videoNode.connect(videoCtx.destination)

    return { videoNode, videoElement: newVideoElement }
}
