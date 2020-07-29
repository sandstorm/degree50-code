import React, { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react'
import ReadOnlyMediaItems from './ReadOnyMediaItems'
import { MediaItem } from '../types'
import ReadOnlyMediaTrack from '../MediaLane/MediaTrack/index'
import { RenderConfig } from '../MediaLane/MediaTrack'
import { useWindowSize } from '../MediaLane/MediaTrack/hooks'
import MediaTrackInteractionArea from '../MediaLane/MediaTrackInteractionArea'

type Props = {
    currentTime: number
    updateCurrentTime: (time: number) => void
    mediaItems: MediaItem[]
}

const initialRender: RenderConfig = {
    padding: 5,
    duration: 10,
    gridNum: 110,
    currentTime: 0,
    timelineStartTime: 0,
}

const ReadOnlyMediaLane = ({ currentTime, updateCurrentTime, mediaItems }: Props) => {
    // TODO this should later become part of the api and probably the redux store
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)

    const player = null // TODO
    const mediaTrackConfig = {} // TODO
    const windowSize = useWindowSize()
    const $container: React.RefObject<HTMLDivElement> = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)

    const updateContainerDimensions = () => {
        if ($container.current) {
            setContainerWidth($container.current.clientWidth)
            setContainerHeight($container.current.clientHeight)
        }
    }

    // Update after initial rendering
    useLayoutEffect(() => {
        updateContainerDimensions()
    }, [])

    // Update after window resize
    useLayoutEffect(() => {
        updateContainerDimensions()
    }, [windowSize])

    // Update when the player plays (and therefore currentTime changes)
    useEffect(() => {
        const newTimelineStartTime = Math.floor(currentTime / renderConfig.duration) * renderConfig.duration

        setRender({
            ...renderConfig,
            currentTime: currentTime,
            timelineStartTime: newTimelineStartTime,
        })
    }, [currentTime])

    const handleLaneClick = useCallback(
        (clickTime) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0
            updateCurrentTime(newCurrentTime)
        },
        [updateCurrentTime]
    )

    const gridGap = containerWidth / renderConfig.gridNum

    return (
        <div className="subtitle-editor-timeline">
            <div className="subtitle-editor-timeline__body">
                <div ref={$container} className="media-track">
                    <ReadOnlyMediaTrack
                        config={mediaTrackConfig} /* empty object = use default values */
                        renderConfig={renderConfig}
                        containerHeight={containerHeight}
                        containerWidth={containerWidth}
                    />
                </div>

                <MediaTrackInteractionArea
                    renderConfig={renderConfig}
                    clickCallback={handleLaneClick}
                    gridGap={gridGap}
                />

                <ReadOnlyMediaItems renderConfig={renderConfig} mediaItems={mediaItems} gridGap={gridGap} />
            </div>
        </div>
    )
}

export default ReadOnlyMediaLane
