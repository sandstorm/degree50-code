import { useCallback, useState, useEffect, useMemo } from 'react'
import { t, setLocale } from 'react-i18nify'
import isEqual from 'lodash/isEqual'

import { secondToTime, notify } from '../utils'
import { Player, MediaItem } from '../components/types'
import Storage from '../utils/storage'

export const useMutablePlayer = (worker?: Worker) => {
    // Player instance
    const [player, setPlayer] = useState<Player | undefined>(undefined)

    // Run only once
    useEffect(() => {
        if (player && worker && !worker.onmessage) {
            worker.onmessage = (event) => {
                player.subtitle.switch(event.data)
            }
        }
    }, [player, worker])

    return {
        player,
        setPlayer,
    }
}

const checkConflictWithPrevItem = (mediaItems: MediaItem<any>[], item: MediaItem<any>, index: number) => {
    const previous = mediaItems[index - 1]
    return (previous && item.startTime < previous.endTime) || !item.check
}

const checkConflictWithNextItem = (mediaItems: MediaItem<any>[], item: MediaItem<any>, index: number) => {
    const next = mediaItems[index + 1]
    return (next && item.endTime > next.startTime) || !item.check
}

const checkConflict = (mediaItems: MediaItem<any>[], item: MediaItem<any>, index: number) => {
    return checkConflictWithPrevItem(mediaItems, item, index) || checkConflictWithNextItem(mediaItems, item, index)
}

export const useMediaItemHandling = <T>({
    mediaItems,
    setMediaItems,
    updateCallback,
    worker,
    storage,
    history,
    updateCondition,
}: {
    mediaItems: Array<MediaItem<T>>
    setMediaItems: (mediaItems: Array<T>) => void
    updateCallback: Function
    updateCondition: boolean
    worker?: Worker
    storage?: Storage
    history?: Array<MediaItem<T>[]>
}) => {
    const defaultLang = storage?.get('language') || navigator.language.toLowerCase() || 'en'
    const [language, setLanguage] = useState(defaultLang)

    // MediaItem currently playing index
    const [currentIndex, setCurrentIndex] = useState(-1)

    // MediaItem currently playing time
    const [currentTimeForMediaItems, setCurrentTimeForMediaItems] = useState(0)

    // Update language
    const updateLang = useCallback(
        (value) => {
            setLocale(value)
            setLanguage(value)

            if (storage) {
                storage.set('language', value)
            }
        },
        [setLanguage]
    )

    // Only way to update all mediaItems
    const updateMediaItems = (items: Array<MediaItem<T>>, saveToHistory = true, force = false) => {
        const notEqualToPreviousItems = !isEqual(items, mediaItems)

        if (force || (updateCondition && notEqualToPreviousItems)) {
            const updatedItems = JSON.parse(JSON.stringify(items))

            // This makes sure that all properties from the original item will be written back to the store
            // E.g. the 'url' property of a cut
            const convertedToOriginalStructure = updatedItems.map((item: MediaItem<T>) => {
                const { originalData, ...rest } = item

                return {
                    ...originalData,
                    ...rest,
                }
            })

            setMediaItems(convertedToOriginalStructure)
            updateCallback()

            if (worker) {
                worker.postMessage(items)
            }

            // Save 100 mediaItems to history
            if (history && saveToHistory) {
                if (history.length >= 100) {
                    history.shift()
                }
                history.push(items.map((item) => item.clone))
            }
        }
    }

    useEffect(() => {
        updateLang(language)
        setCurrentIndex(
            mediaItems.findIndex(
                (item) => item.startTime <= currentTimeForMediaItems && item.endTime > currentTimeForMediaItems
            )
        )

        if (worker) {
            // Takes care of the mediaItems which overlay the video
            worker.postMessage(mediaItems)
        }
    }, [worker])

    // Update current index from current time
    useMemo(() => {
        setCurrentIndex(
            mediaItems.findIndex(
                (item) => item.startTime <= currentTimeForMediaItems && item.endTime > currentTimeForMediaItems
            )
        )
    }, [currentTimeForMediaItems, setCurrentIndex])

    // Detect if the mediaItem exists (referential check)
    const hasMediaItem = useCallback((item) => mediaItems.indexOf(item), [mediaItems])

    // Copy all mediaItems
    const copyMediaItems = useCallback(() => mediaItems.map((item) => item.clone), [mediaItems])

    // Check if mediaItem is legal
    // true == illegal, false == legal
    const checkMediaItem = useCallback(
        (item: MediaItem<T>): boolean => {
            const index = hasMediaItem(item)
            if (index < 0) return false
            return checkConflict(mediaItems, item, index)
        },
        [hasMediaItem, mediaItems]
    )

    // Update a single mediaItem
    const updateMediaItem = useCallback(
        (item: MediaItem<T>, updatedValues: Object) => {
            const index = hasMediaItem(item)

            if (index < 0) return

            const copiedItems = copyMediaItems()
            const { clone } = item

            Object.assign(clone, updatedValues)

            if (clone.check) {
                copiedItems[index] = clone
                updateMediaItems(copiedItems)
            } else {
                notify(t('parameter-error'), 'error')
            }
        },
        [hasMediaItem, copyMediaItems, updateMediaItems]
    )

    // Delete a mediaItem
    const removeMediaItem = useCallback(
        (mediaItem) => {
            const index = hasMediaItem(mediaItem)

            if (index < 0) return mediaItems

            const updatedItems = [...mediaItems.slice(0, index), ...mediaItems.slice(index + 1)]

            updateMediaItems(updatedItems)
        },
        [hasMediaItem, copyMediaItems, updateMediaItems]
    )

    // Add a mediaItem
    const appendMediaItem = useCallback(() => {
        const lastItem = mediaItems[mediaItems.length - 1]

        const start = lastItem ? secondToTime(lastItem.endTime + 0.1) : '00:00:00.001'
        const end = lastItem ? secondToTime(lastItem.endTime + 1.1) : '00:00:01.001'
        const newItem = new MediaItem({
            start,
            end,
            text: t('subtitle-text'),
            memo: '',
            originalData: {} as T,
            lane: 0,
            idFromPrototype: null,
        })

        updateMediaItems([...mediaItems, newItem])
    }, [updateMediaItems, mediaItems])

    return {
        language,
        currentIndex,
        currentTimeForMediaItems,
        setCurrentIndex,
        setCurrentTimeForMediaItems,
        appendMediaItem,
        removeMediaItem,
        updateMediaItem,
        hasMediaItem,
        updateMediaItems,
        checkMediaItem,
        copyMediaItems,
        updateLang,
    }
}
