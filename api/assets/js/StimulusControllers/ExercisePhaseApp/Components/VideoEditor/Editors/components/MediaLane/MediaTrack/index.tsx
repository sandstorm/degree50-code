import React, { useRef, useLayoutEffect } from 'react'
import { updateCanvas } from './helpers'

export type RenderConfig = {
    padding: number
    duration: number
    gridNum: number
    timelineStartTime: number
    currentTime: number
}

export type MediaTrackConfig = {
    backgroundColor?: string
    rulerBackgroundColor?: string
    gridColor?: string
    rulerColor?: string
    cursorColor?: string
    fontSize?: number
    fontHeight?: number
    fontTop?: number
}

type Props = {
    renderConfig: RenderConfig
    config: MediaTrackConfig
    containerHeight: number
    containerWidth: number
}

const MediaTrack = ({
    config: {
        backgroundColor = '#454545',
        rulerBackgroundColor = '#333',
        gridColor = '#636363',
        rulerColor = '#fff',
        cursorColor = '#ff0000',
        fontSize = 13,
        fontHeight = 15,
        fontTop = 30,
    },
    containerHeight,
    containerWidth,
    renderConfig,
}: Props) => {
    const pixelRatio = 1

    const $canvas: React.RefObject<HTMLCanvasElement> = useRef(null)

    const config = {
        backgroundColor,
        rulerBackgroundColor,
        gridColor,
        pixelRatio,
        rulerColor,
        fontSize,
        fontHeight,
        fontTop,
        cursorColor,
        render: renderConfig,
    }

    // Update tracks elements when container size or config changed
    useLayoutEffect(() => {
        if ($canvas.current) {
            updateCanvas($canvas.current, config)
        }
    }, [containerHeight, containerWidth, config])

    return <canvas ref={$canvas} width={containerWidth} height={containerHeight} />
}

export default React.memo(MediaTrack)
