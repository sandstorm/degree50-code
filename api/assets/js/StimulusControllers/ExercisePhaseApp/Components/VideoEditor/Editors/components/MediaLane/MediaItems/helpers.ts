import { MediaItem } from '../../types'

export const itemIsVisible = (item: MediaItem, timelineStartTime: number, duration: number) =>
    (item.startTime >= timelineStartTime && item.startTime <= timelineStartTime + duration) ||
    (item.endTime >= timelineStartTime && item.endTime <= timelineStartTime + duration)
