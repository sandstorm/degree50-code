import DT from 'duration-time-conversion'
import { toast, TypeOptions } from 'react-toastify'

export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)
}

export function getExt(url: string): string | undefined {
    if (url.includes('?')) {
        return getExt(url.split('?')[0])
    }

    if (url.includes('#')) {
        return getExt(url.split('#')[0])
    }

    return url.trim().toLowerCase().split('.').pop()
}

export function sleep(ms: number = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function secondToTime(seconds: number = 0) {
    return DT.d2t(seconds.toFixed(3))
}

export function timeToSecond(time: string): number {
    return DT.t2d(time)
}

export function downloadFile(url: string, name: string): void {
    const elink = document.createElement('a')
    elink.style.display = 'none'
    elink.href = url
    elink.download = name
    document.body.appendChild(elink)
    elink.click()
    document.body.removeChild(elink)
}

export function notify(text: string = '', type: TypeOptions = 'info') {
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

export function getKeyCode(event: KeyboardEvent): number | undefined {
    const tag = document?.activeElement?.tagName.toUpperCase()
    const editable = document?.activeElement?.getAttribute('contenteditable')
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && editable !== '' && editable !== 'true') {
        return Number(event.keyCode)
    }
}
