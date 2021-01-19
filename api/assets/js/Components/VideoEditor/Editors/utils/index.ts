import DT from 'duration-time-conversion'
import { toast, TypeOptions } from 'react-toastify'

export function isMobile() {
    // TODO: is there something more robust?
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)
}

// TODO: What is "Ext"?
export function getExt(url: string): string | undefined {
    if (url.includes('?')) {
        return getExt(url.split('?')[0])
    }

    if (url.includes('#')) {
        return getExt(url.split('#')[0])
    }

    return url.trim().toLowerCase().split('.').pop()
}

export function sleep(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function secondToTime(seconds = 0) {
    return DT.d2t(seconds.toFixed(3))
}

export function timeToSecond(time: string): number {
    return DT.t2d(time)
}

export function notify(text = '', type: TypeOptions = 'info') {
    // info success warning error default

    // FIXME
    // @ts-ignore disable-line
    const toastFn = toast[type]

    return (
        text.trim() &&
        toastFn(text, {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        })
    )
}

// TODO: Unused.
// TODO: Deprecated "keyCode"
// TODO: Why check for element type and editable?
export function getKeyCode(event: KeyboardEvent): number | undefined {
    const tag = document?.activeElement?.tagName.toUpperCase()
    const editable = document?.activeElement?.getAttribute('contenteditable')
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && editable !== '' && editable !== 'true') {
        return Number(event.keyCode)
    }
}

export const getSecondsFromTimeSeconds = (seconds: number) => (seconds % 60) % 60
export const getMinutesFromTimeSeconds = (seconds: number) => Math.floor(seconds / 60) % 60
export const getHoursFromTimeSeconds = (seconds: number) => Math.floor(seconds / 60 / 60)

/**
 * Formatter for number of hours to string representation.
 *
 * Example:
 *  HoursStringFormatter.format(5) -> "05"
 */
export const HoursStringFormatter = Intl.NumberFormat('en', {
    minimumIntegerDigits: 2,
    useGrouping: false,
})

/**
 * Formatter for number of minutes to string representation.
 *
 * Example:
 *  MinutesStringFormatter.format(2) -> "02"
 */
export const MinutesStringFormatter = Intl.NumberFormat('en', {
    minimumIntegerDigits: 2,
    useGrouping: false,
})

/**
 * Formatter for number of seconds to string representation.
 * This representation is including the milliseconds as fraction digits.
 *
 * Example:
 *  SecondsStringFormatter.format(23) -> "23.000"
 *  SecondsStringFormatter.format(5.23) -> "05.230"
 */
export const SecondsStringFormatter = Intl.NumberFormat('en', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    minimumIntegerDigits: 2,
    useGrouping: false,
})

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), max)
