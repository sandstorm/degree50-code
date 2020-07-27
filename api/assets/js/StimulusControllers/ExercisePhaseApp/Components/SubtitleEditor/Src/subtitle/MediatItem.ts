import clamp from 'lodash/clamp'
import { timeToSecond, secondToTime } from '../utils'

export default class MediaItem {
    start: string
    end: string
    text: string
    color: null | string

    constructor(start: string, end: string, text: string, color: string | null = null) {
        this.start = start
        this.end = end
        this.text = text
        this.color = color
    }

    get check(): boolean {
        return this.startTime >= 0 && this.endTime >= 0 && this.startTime < this.endTime
    }

    get clone(): MediaItem {
        return new MediaItem(this.start, this.end, this.text, this.color)
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
