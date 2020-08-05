import { MediaItem } from '../../types'

export const itemIsVisible = <T>(item: MediaItem<T>, timelineStartTime: number, duration: number) =>
    (item.startTime >= timelineStartTime && item.startTime <= timelineStartTime + duration) ||
    (item.endTime >= timelineStartTime && item.endTime <= timelineStartTime + duration)
