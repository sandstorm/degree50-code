import { MediaItem } from '../../types'

export const itemIsVisible = <T>(
    item: MediaItem<T>,
    currentTimelineClippingStart: number,
    timelineClippingDuration: number
) => {
    const timelineClippingEnd = currentTimelineClippingStart + timelineClippingDuration

    return item.startTime <= timelineClippingEnd && item.endTime >= currentTimelineClippingStart
}
