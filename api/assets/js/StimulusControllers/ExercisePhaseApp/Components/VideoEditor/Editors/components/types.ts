import clamp from 'lodash/clamp'
import { timeToSecond, secondToTime } from '../utils'

export class MediaItem<T> {
    start: string
    end: string
    text: string
    color: null | string
    lane: number
    originalData: T

    constructor({
        start,
        end,
        text,
        color = null,
        originalData,
        lane = 0,
    }: {
        start: string
        end: string
        text: string
        color?: string | null
        lane: number
        originalData: T
    }) {
        this.start = start
        this.end = end
        this.text = text
        this.color = color
        this.originalData = originalData
        this.lane = lane
    }

    get check(): boolean {
        return this.startTime >= 0 && this.endTime >= 0 && this.startTime < this.endTime
    }

    get clone(): MediaItem<T> {
        return new MediaItem({
            start: this.start,
            end: this.end,
            text: this.text,
            color: this.color,
            originalData: this.originalData,
            lane: this.lane,
        })
    }

    get startTime(): number {
        return timeToSecond(this.start)
    }

    set startTime(time) {
        this.start = secondToTime(clamp(time, 0, Infinity))
    }

    get endTime(): number {
        return timeToSecond(this.end)
    }

    set endTime(time) {
        this.end = secondToTime(clamp(time, 0, Infinity))
    }

    get duration(): string {
        return (this.endTime - this.startTime).toFixed(3)
    }
}

export type Player = {
    pause: boolean
    duration: number
    seek: number
    playing: boolean
    currentTime: number
    subtitle: { switch: Function } // FIXME
}
