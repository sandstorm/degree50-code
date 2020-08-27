import { getExt, secondToTime } from '.'
import { MediaItem } from '../components/types'

export function checkIsFile(source: unknown): boolean {
    return source instanceof File
}

export function getType(source: File | string) {
    return checkIsFile(source) ? getExt((source as File).name) : getExt(source as string)
}

export function vttToUrl(vtt: BlobPart) {
    return URL.createObjectURL(
        new Blob([vtt], {
            type: 'text/vtt',
        })
    )
}

// Worker code which can be registered to a web worker.
// Upon receiving a message containing a list of subtitle objects, the worker
// will transform the list into a WebVTT blob which can then be consumed by players.
export function vttToUrlUseWorker() {
    // In memory worker file
    // The blob is created from an iife in form of a string, so that we can
    // easier read, write and format it.
    const workerFileBlob = new Blob(
        [
            '(',
            function () {
                onmessage = (event) => {
                    // WebVTT file blob which is used to display the actual
                    // subtitles.
                    // The subtitle switch is wired inside our useMutablePlayer() hook.
                    const blob = new Blob(
                        [
                            `WEBVTT

                        ${event.data
                            .map(
                                (item: { start: string; end: string; text: string }, index: number) => `
                                ${index + 1}
                                ${item.start} --> ${item.end}
                                ${item.text}
                                `
                            )
                            .join('\n\n')}
                        `,
                        ],
                        {
                            type: 'text/vtt',
                        }
                    )

                    // Returns the in memory URL of our WebVTT file
                    // FIXME
                    // We shouldn't ts-ignore here, but I couldn't figure out
                    // a working argument for postMessages 'targetOrigin' parameter
                    // @ts-ignore
                    postMessage(URL.createObjectURL(blob))
                }
            }.toString(),
            ')()',
        ],
        {
            type: 'application/javascript',
        }
    )

    // Returns the in memory URL representation of our worker file
    return URL.createObjectURL(workerFileBlob)
}

export async function getSubFromVttUrl(url: string) {
    return new Promise((resolve) => {
        const $video = document.createElement('video')
        const $track = document.createElement('track')
        $track.default = true
        $track.kind = 'metadata'
        $video.appendChild($track)

        $track.onload = () => {
            resolve(
                // FIXME
                // @ts-ignore disable-line
                Array.from($track.track.cues).map((item) => {
                    const start = secondToTime(item.startTime)
                    const end = secondToTime(item.endTime)

                    // FIXME
                    // @ts-ignore disable-line
                    const text = item.text
                    return new MediaItem({ start, end, text, memo: '', originalData: item, lane: 0 })
                })
            )
        }

        $track.src = url
    })
}
