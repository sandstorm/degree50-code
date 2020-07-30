import { RefObject } from 'react'
import VideoContext from 'videocontext'
import { Cut } from './types'
import { t2d } from 'duration-time-conversion'

export const initVideoContext = (canvasRef: RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const videoCtx = new VideoContext(canvas)
    const combineEffect = videoCtx.compositor(VideoContext.DEFINITIONS.COMBINE)

    // connect all sources
    combineEffect.connect(videoCtx.destination)

    // init timeline
    function render() {
        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)

    return { videoCtx, combineEffect }
}

// FIXME videoCtx typings
export const addCut = (cut: Cut, videoCtx: any, combineEffect: any) => {
    const videoNode = videoCtx.video(cut.url, cut.offset, 4, {
        volume: 0.6,
        loop: false,
    })

    const start = t2d(cut.start)
    const duration = t2d(cut.end) - t2d(cut.start)

    videoNode._playbackRate = cut.playbackRate
    videoNode.start(start)
    videoNode.stop(cut.start + duration)

    videoNode.connect(combineEffect)

    return videoNode
}
