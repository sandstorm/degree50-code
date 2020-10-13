import clamp from 'lodash/clamp'
import { timeToSecond, secondToTime } from '../utils'

export class MediaItem<T> {
    start: string
    end: string
    text: string
    memo: string
    color: null | string
    lane: number
    idFromPrototype: null | string
    originalData: T

    constructor({
        start,
        end,
        text,
        memo,
        color = null,
        originalData,
        lane = 0,
        idFromPrototype,
    }: {
        start: string
        end: string
        text: string
        memo: string
        color?: string | null
        lane: number
        idFromPrototype: string | null
        originalData: T
    }) {
        this.start = start
        this.end = end
        this.text = text
        this.memo = memo
        this.color = color
        this.originalData = originalData
        this.lane = lane
        this.idFromPrototype = idFromPrototype
    }

    public startsBefore(item: MediaItem<any>): boolean {
        return this.startTime > item.startTime
    }

    get check(): boolean {
        return this.startTime >= 0 && this.endTime >= 0 && this.startTime < this.endTime
    }

    get clone(): MediaItem<T> {
        return new MediaItem({
            start: this.start,
            end: this.end,
            text: this.text,
            memo: this.memo,
            color: this.color,
            originalData: this.originalData,
            lane: this.lane,
            idFromPrototype: this.idFromPrototype,
        })
    }

    get startTime(): number {
        return timeToSecond(this.start)
    }

    get endTime(): number {
        return timeToSecond(this.end)
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
    subtitle: { switch: (data: Record<string, unknown>) => void }
}
