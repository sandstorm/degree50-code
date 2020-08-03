import React, { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { connect } from 'react-redux'

import { AppState } from '../../../../Store/Store'
import { initVideoContext, addCut } from './util'
import { CutList } from './types'

type OwnProps = {
    cutList: CutList
}

const mapStateToProps = (state: AppState) => ({})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoContextPlayer = ({ cutList }: Props) => {
    const [videoContext, setVideoContext] = useState(undefined)
    const [cEffect, setCEffect] = useState(undefined)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const { videoCtx, combineEffect } = initVideoContext(canvasRef)
        setVideoContext(videoCtx)
        setCEffect(combineEffect)
    }, [])

    useEffect(() => {
        if (videoContext && cutList.length > 0) {
            console.log('adding nodes')
            cutList.forEach((cut) => addCut(cut, videoContext, cEffect))
        }
    }, [cutList, videoContext, cEffect])

    const handlePlay = () => {
        // @ts-ignore disable-line
        if (videoContext.currentTime >= videoContext.duration) {
            // @ts-ignore disable-line
            videoContext.currentTime = 0
        }

        // @ts-ignore disable-line
        videoContext.play()
    }

    const handlePause = () => {
        // @ts-ignore disable-line
        videoContext.pause()
    }

    return (
        <>
            <canvas ref={canvasRef} id="canvas" width="800" height="400" />
            <div id="timestamp">
                <span id="current-time" />/<span id="duration" />
            </div>
            <div className="actions">
                <button className="video-button" onClick={handlePlay}>
                    Play
                </button>
                <button className="video-button" onClick={handlePause}>
                    Pause
                </button>
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoContextPlayer))
