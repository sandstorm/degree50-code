import React, { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react'
import MediaItems from './MediaItems'
import { MediaItem } from '../types'
import MediaTrack, { MediaTrackConfig } from './MediaTrack'
import { RenderConfig } from './MediaTrack'
import MediaTrackInteractionArea from './MediaTrackInteractionArea'
import { useWindowSize } from './MediaTrack/hooks'
import Toolbar from './Toolbar'
import { actions } from '../../../PlayerSlice'

type Props = {
    currentTime: number
    mediaItems: MediaItem[]
    updateMediaItem: (item: MediaItem, updatedValues: Object) => void // FIXME refine key
    mediaTrackConfig?: MediaTrackConfig
    setPlayPosition: typeof actions.setPlayPosition
}

const initialRender: RenderConfig = {
    padding: 5,
    duration: 10,
    gridNum: 110,
    currentTime: 0,
    timelineStartTime: 0,
}

const MediaLane = ({ currentTime, mediaTrackConfig = {}, updateMediaItem, mediaItems, setPlayPosition }: Props) => {
    // TODO this should later become part of the api and probably the redux store
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)

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

    // TODO refactor
    const handleLaneClick = useCallback(
        (clickTime) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0

            setPlayPosition(newCurrentTime)

            const newTimelineStartTime = Math.floor(newCurrentTime / renderConfig.duration) * renderConfig.duration

            setRender({
                ...renderConfig,
                currentTime: newCurrentTime,
                timelineStartTime: newTimelineStartTime,
            })
        },
        [renderConfig]
    )

    const handleMediaItemUpdate = useCallback(
        (item: MediaItem, updatedValues: { start?: string; end?: string }, newStartTime: number) => {
            updateMediaItem(item, updatedValues)

            setPlayPosition(newStartTime)
        },
        [updateMediaItem]
    )

    const handleZoom = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newDuration = parseInt(event.currentTarget.value) || 10
            const newGridNum = newDuration * 10 + renderConfig.padding * 2

            setRender({
                ...renderConfig,
                duration: newDuration,
                gridNum: newGridNum,
            })
        },
        [renderConfig]
    )

    const gridGap = containerWidth / renderConfig.gridNum

    return (
        <div className="video-editor-timeline">
            <Toolbar zoomHandler={handleZoom} />

            <div className="video-editor-timeline__body">
                <div ref={$container} className="media-track">
                    <MediaTrack
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

                <MediaItems
                    currentTime={currentTime}
                    renderConfig={renderConfig}
                    mediaItems={mediaItems}
                    gridGap={gridGap}
                    updateMediaItem={handleMediaItemUpdate}
                />
            </div>
        </div>
    )
}

export default MediaLane
