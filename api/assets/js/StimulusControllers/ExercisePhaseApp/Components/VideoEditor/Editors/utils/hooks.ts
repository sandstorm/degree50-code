import { useCallback, useState, useEffect, useMemo } from 'react'
import { t, setLocale } from 'react-i18nify'
import isEqual from 'lodash/isEqual'

import { secondToTime, notify } from '../utils'
import { Player, MediaItem } from '../components/types'
import Storage from '../utils/storage'

export const useMediaItemHandling = ({
    userId,
    currentEditorId,
    mediaItems,
    readOnly,
    setMediaItems,
    updateCallback,
    worker,
    storage,
    history,
}: {
    userId: string
    currentEditorId: string | undefined
    mediaItems: MediaItem[]
    readOnly: boolean
    setMediaItems: (mediaItems: MediaItem[]) => unknown
    updateCallback: Function
    worker?: Worker
    storage: Storage
    history?: Array<MediaItem[]>
}) => {
    const defaultLang = storage.get('language') || navigator.language.toLowerCase() || 'en'
    const [language, setLanguage] = useState(defaultLang)

    // Player instance
    const [player, setPlayer] = useState<Player | undefined>(undefined)

    // MediaItem currently playing index
    const [currentIndex, setCurrentIndex] = useState(-1)

    // MediaItem currently playing time
    const [currentTime, setCurrentTime] = useState(0)

    // Update language
    const updateLang = useCallback(
        (value) => {
            setLocale(value)
            setLanguage(value)
            storage.set('language', value)
        },
        [setLanguage]
    )

    // Only way to update all mediaItems
    const updateMediaItems = (items: MediaItem[], saveToHistory = true) => {
        const userIsCurrentEditor = userId === currentEditorId
        const hasItems = items.length
        const notEqualToPreviousItems = !isEqual(items, mediaItems)

        if ((userIsCurrentEditor || !readOnly) && hasItems && notEqualToPreviousItems) {
            setMediaItems(JSON.parse(JSON.stringify(items)))
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

    // Run only once
    useEffect(() => {
        updateLang(language)
        setCurrentIndex(mediaItems.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime))

        if (player && worker && !worker.onmessage) {
            worker.onmessage = (event) => {
                player.subtitle.switch(event.data)
            }
        }

        if (worker) {
            // Takes care of the mediaItems which overlay the video
            worker.postMessage(mediaItems.map((item) => new MediaItem(item.start, item.end, item.text)))
        }
    }, [player, worker])

    // Update current index from current time
    useMemo(() => {
        setCurrentIndex(mediaItems.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime))
    }, [currentTime, setCurrentIndex])

    // Detect if the mediaItem exists
    const hasMediaItem = useCallback((item) => mediaItems.indexOf(item), [mediaItems])

    // Copy all mediaItems
    const copyMediaItems = useCallback(() => mediaItems.map((item) => item.clone), [mediaItems])

    // Check if mediaItem is legal
    const checkMediaItem = useCallback(
        (item: MediaItem): boolean => {
            const index = hasMediaItem(item)

            if (index < 0) return false

            const previous = mediaItems[index - 1]
            return (previous && item.startTime < previous.endTime) || !item.check
        },
        [hasMediaItem, mediaItems]
    )

    // Update a single mediaItem
    const updateMediaItem = useCallback(
        (item, key, value) => {
            const index = hasMediaItem(item)

            if (index < 0) return

            const subs = copyMediaItems()
            const { clone } = item

            if (typeof key === 'object') {
                Object.assign(clone, key)
            } else {
                clone[key] = value
            }

            if (clone.check) {
                subs[index] = clone
                updateMediaItems(subs)
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

            if (index < 0) return

            const subs = copyMediaItems()

            if (subs.length === 1) {
                return notify(t('keep-one'), 'error')
            }

            subs.splice(index, 1)
            updateMediaItems(subs)
        },
        [hasMediaItem, copyMediaItems, updateMediaItems]
    )

    // Add a mediaItem
    const addMediaItem = useCallback(
        (index, mediaItem) => {
            const subs = copyMediaItems()

            if (mediaItem) {
                subs.splice(index, 0, mediaItem)
            } else {
                const previous = subs[index - 1]
                const start = previous ? secondToTime(previous.endTime + 0.1) : '00:00:00.001'
                const end = previous ? secondToTime(previous.endTime + 1.1) : '00:00:01.001'
                const sub = new MediaItem(start, end, t('subtitle-text'))

                subs.splice(index, 0, sub)
            }
            updateMediaItems(subs)
        },
        [copyMediaItems, updateMediaItems]
    )

    return {
        currentIndex,
        currentTime,
        player,

        setPlayer,
        setCurrentIndex,
        setCurrentTime,
        addMediaItem,
        removeMediaItem,
        updateMediaItem,
        updateMediaItems,
        checkMediaItem,
        copyMediaItems,
    }
}
