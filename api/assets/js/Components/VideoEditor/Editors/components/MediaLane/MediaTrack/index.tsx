import React, { useRef, useLayoutEffect } from 'react'
import { updateCanvas } from './helpers'

export type RenderConfig = {
    padding: number
    duration: number
    gridNum: number
    gridGap: number
    timelineStartTime: number
    currentTime: number
}

export type MediaTrackConfig = {
    backgroundColor: string
    rulerBackgroundColor: string
    rulerHeight: number
    gridColor: string
    pixelRatio: number
    rulerColor: string
    fontSize: number
    fontHeight: number
    fontTop: number
    cursorColor: string
    render: RenderConfig
}

type Props = {
    mediaTrackConfig: MediaTrackConfig
    containerHeight: number
    containerWidth: number
}

const MediaTrack = ({ mediaTrackConfig, containerHeight, containerWidth }: Props) => {
    const $canvas: React.RefObject<HTMLCanvasElement> = useRef(null)

    // Update tracks elements when container size or config changed
    useLayoutEffect(() => {
        if ($canvas.current) {
            updateCanvas($canvas.current, mediaTrackConfig)
        }
    }, [containerHeight, containerWidth, mediaTrackConfig])

    return <canvas ref={$canvas} width={containerWidth} height={containerHeight} />
}

export default React.memo(MediaTrack)
