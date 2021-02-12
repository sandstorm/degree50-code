import React, { FC, memo, RefObject } from 'react'

type Props = {
    canvasRef: RefObject<HTMLCanvasElement>
    canvasWidth: number
    canvasHeight: number
}

const VideoContextCanvas: FC<Props> = (props) => {
    return (
        <canvas
            ref={props.canvasRef}
            className={'video-context-player__canvas'}
            width={props.canvasWidth}
            height={props.canvasHeight}
        />
    )
}

export default memo(VideoContextCanvas)
