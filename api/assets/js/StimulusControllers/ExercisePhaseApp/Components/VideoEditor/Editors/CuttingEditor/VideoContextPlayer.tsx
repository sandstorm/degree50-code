import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import VideoContext from 'videocontext'

import { AppState } from '../../../../Store/Store'
import { actions, selectors } from '../../PlayerSlice'
import { initVideoContext, addCut } from './util'
import { CutList } from './types'

type OwnProps = {
    cutList: CutList
    currentTimeCallback: (time: number) => void
    volume: number
}

const mapStateToProps = (state: AppState) => ({
    playPosition: selectors.selectPlayPosition(state),
})

const mapDispatchToProps = {
    setSyncPlayPosition: actions.setSyncPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoContextPlayer = ({ cutList, currentTimeCallback, setSyncPlayPosition, playPosition, volume }: Props) => {
    const [videoContext, setVideoContext] = useState<VideoContext | undefined>(undefined)
    const [cEffect, setCEffect] = useState(undefined)
    const canvasRef = useRef(null)

    const resetVideoContext = () => {
        const { videoCtx, combineEffect } = initVideoContext(canvasRef)
        setVideoContext(videoCtx)
        setCEffect(combineEffect)

        return { videoCtx, combineEffect }
    }

    // Initialize video context on first render (runs once)
    useLayoutEffect(() => {
        resetVideoContext()
    }, [])

    // Update volume
    useEffect(() => {
        if (videoContext) {
            videoContext.volume = volume
        }
    }, [videoContext, volume])

    // Update sync when player is running
    useEffect(() => {
        videoContext?.registerCallback(VideoContext.EVENTS.UPDATE, () => {
            if (videoContext.state === VideoContext.STATE.PLAYING) {
                const currentTime = videoContext.currentTime
                setSyncPlayPosition(currentTime)
                currentTimeCallback(currentTime)
            }
        })
    }, [videoContext, setSyncPlayPosition, currentTimeCallback])

    // Set player position from the outside.
    useEffect(() => {
        if (videoContext) {
            videoContext.currentTime = playPosition
            setSyncPlayPosition(playPosition)
            currentTimeCallback(playPosition)
        }
    }, [videoContext, playPosition])

    // Update video context with new nodes
    useEffect(() => {
        const { videoCtx, combineEffect } = resetVideoContext()

        if (videoCtx && cutList.length > 0) {
            cutList.forEach((cut) => addCut(cut, videoCtx, combineEffect))
        }
    }, [cutList])

    const handlePlay = useCallback(() => {
        if (!videoContext) return

        if (videoContext.currentTime >= videoContext.duration) {
            videoContext.currentTime = 0
        }

        videoContext.play()
    }, [videoContext])

    const handlePause = useCallback(() => {
        if (videoContext) {
            videoContext.pause()
        }
    }, [videoContext])

    return (
        <>
            <canvas ref={canvasRef} className={'video-context-player'} />
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
