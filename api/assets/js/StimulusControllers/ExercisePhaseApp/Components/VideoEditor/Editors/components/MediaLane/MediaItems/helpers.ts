import { MediaItem } from '../../types'

export const itemIsVisible = <T>(item: MediaItem<T>, currentTimelineClippingStart: number) => {
    const itemStartsBeforeOrAtTimelineClippingStart = item.startTime <= currentTimelineClippingStart
    const itemEndsAfterTimelineClippingStart = item.endTime > currentTimelineClippingStart

    return itemStartsBeforeOrAtTimelineClippingStart && itemEndsAfterTimelineClippingStart
}
