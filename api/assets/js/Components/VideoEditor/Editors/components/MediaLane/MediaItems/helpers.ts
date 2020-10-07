import { MediaItem } from '../../types'

export const hasConflictWithItem = (
    itemA: { startTime: number; endTime: number },
    itemB: { startTime: number; endTime: number }
): boolean => itemA.startTime <= itemB.endTime && itemA.endTime >= itemB.startTime

export const itemIsVisible = <T>(
    item: MediaItem<T>,
    currentTimelineClippingStart: number,
    timelineClippingDuration: number
) => {
    const timelineClippingEnd = currentTimelineClippingStart + timelineClippingDuration

    return item.startTime <= timelineClippingEnd && item.endTime >= currentTimelineClippingStart
}

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), max)
