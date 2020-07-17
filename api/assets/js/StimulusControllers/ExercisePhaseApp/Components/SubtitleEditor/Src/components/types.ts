export type Player = {
    pause: boolean
    duration: number
    seek: number
    playing: boolean
    currentTime: number
    subtitle: { switch: Function } // FIXME
}
