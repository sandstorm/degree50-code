import clamp from 'lodash/clamp'
import { timeToSecond, secondToTime } from '../utils'

export class MediaItem {
    start: string
    end: string
    text: string
    color: null | string
    originalData: Object

    constructor({
        start,
        end,
        text,
        color = null,
        originalData,
    }: {
        start: string
        end: string
        text: string
        color?: string | null
        originalData: Object
    }) {
        this.start = start
        this.end = end
        this.text = text
        this.color = color
        this.originalData = originalData
    }

    get check(): boolean {
        return this.startTime >= 0 && this.endTime >= 0 && this.startTime < this.endTime
    }

    get clone(): MediaItem {
        return new MediaItem({
            start: this.start,
            end: this.end,
            text: this.text,
            color: this.color,
            originalData: this.originalData,
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
