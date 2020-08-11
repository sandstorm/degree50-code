import { RefObject, useState, useCallback, useEffect } from 'react'
import VideoContext from 'videocontext'
import { t } from 'react-i18nify'
import { d2t, t2d } from 'duration-time-conversion'

import { selectors, actions } from '../../PlayerSlice'
import { Cut } from './types'
import { MediaItem } from '../components/types'
import { notify } from '../utils'
import { useMediaItemHandling } from '../utils/hooks'
import Storage from '../utils/storage'

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
    userId,
    currentEditorId,
    mediaItems,
    readOnly,
    setCutList,
    updateCallback,
    storage,
    playerSyncPlayPosition,
    setPlayPosition,
}: {
    userId: string
    currentEditorId: string | undefined
    mediaItems: Array<MediaItem<Cut>>
    readOnly: boolean
    setCutList: (mediaItems: Array<Cut>) => void
    updateCallback: Function
    storage: Storage
    playerSyncPlayPosition: ReturnType<typeof selectors.selectSyncPlayPosition>
    setPlayPosition: typeof actions.setPlayPosition
}) => {
    const {
        currentIndex,

        setCurrentTimeForMediaItems,
        removeMediaItem,
        updateMediaItems,
        checkMediaItem,
        hasMediaItem,
        copyMediaItems,
    } = useMediaItemHandling<Cut>({
        userId: userId,
        currentEditorId: currentEditorId,
        mediaItems,
        readOnly: readOnly,
        setMediaItems: setCutList,
        updateCallback,
        storage,
    })

    /**
     * Handles the update of Cut media items and makes sure that their offset is handled correctly
     */
    const updateMediaItem = useCallback(
        (item: MediaItem<Cut>, updatedValues: { start?: string; end?: string }) => {
            const index = hasMediaItem(item)

            if (index < 0) return

            const copiedItems = copyMediaItems()
            const { clone } = item

            const newValues = {
                ...updatedValues,
                ...(updatedValues.start ? { offset: updateOffset(item, updatedValues.start, updatedValues?.end) } : {}),
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

/**
 * Given a VideoContext and a Cut this directly adds a new videoNode to the context
 */
export const addCut = (cut: Cut, videoCtx: VideoContext) => {
    // We create the video node ourselfs, because we need it asap, to retrieve
    // the aspect ratio of the first video node to determine the dimensons of
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
