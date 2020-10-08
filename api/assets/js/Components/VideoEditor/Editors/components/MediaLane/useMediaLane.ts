import { useLayoutEffect, useEffect, useState, useCallback } from 'react'
import { RenderConfig } from './MediaTrack'
import { useDebouncedResizeObserver } from '../../utils/useDebouncedResizeObserver'

/**
 * The initial zoom value in %.
 */
export const INITIAL_ZOOM = 100
export const MEDIA_LANE_HEIGHT = 200
export const MEDIA_LANE_TOOLBAR_HEIGHT = 40

const initialRender: RenderConfig = {
    padding: 0,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
    drawRuler: true,
}

const getDurationForRenderConfig = (durationInPercentage: number, videoDuration: number) => {
    return Math.round((videoDuration / 100) * durationInPercentage)
}

// TODO comment and refactor

export const useMediaLane = ({
    $container,
    currentTime,
    videoDuration,
    laneClickCallback,
}: {
    $container: React.RefObject<HTMLDivElement>
    currentTime: number
    videoDuration: number
    laneClickCallback: (newCurrentTime: number) => void
}) => {
    const [renderConfig, setRenderConfig] = useState<RenderConfig>(initialRender)
    const { width: containerWidth, height: containerHeight } = useDebouncedResizeObserver($container, 500)

    const updateRenderConfigOnResize = (containerWidth: number) => {
        const newGridGap = containerWidth / renderConfig.gridNum

        setRenderConfig({
            ...renderConfig,
            gridGap: newGridGap,
        })
    }

    const setRenderConfigForZoom = (zoomInPercent: number) => {
        const newDuration = getDurationForRenderConfig(zoomInPercent, videoDuration)
        const newGridNum = newDuration * 10 + renderConfig.padding * 2
        const newGridGap = containerWidth / newGridNum

        // we zoom around the current time
        let newTimelineStartTime = Math.round(currentTime - newDuration / 2)

        // in case the new start-time + the new duration is larger than the duration of video
        if (newTimelineStartTime + newDuration >= videoDuration) {
            newTimelineStartTime = Math.round(
                newTimelineStartTime - (newTimelineStartTime + newDuration - videoDuration)
            )
        }

        if (newTimelineStartTime < 0) {
            newTimelineStartTime = 0
        }

        setRenderConfig({
            ...renderConfig,
            duration: newDuration,
            gridNum: newGridNum,
            gridGap: newGridGap,
            timelineStartTime: newTimelineStartTime,
        })
    }

    const handleLaneClick = useCallback(
        (clickTime: number) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0

            laneClickCallback(newCurrentTime)

            const newTimelineStartTime = Math.floor(newCurrentTime / renderConfig.duration) * renderConfig.duration

            setRenderConfig({
                ...renderConfig,
                currentTime: newCurrentTime,
                timelineStartTime: newTimelineStartTime,
            })
        },
        [renderConfig]
    )

    const handleZoom = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setRenderConfigForZoom(parseInt(event.currentTarget.value))
        },
        [setRenderConfigForZoom]
    )

    // Update after initial rendering
    useLayoutEffect(() => {
        updateRenderConfigOnResize(containerWidth)
    }, [])

    // Update after resize
    useEffect(() => {
        updateRenderConfigOnResize(containerWidth)
    }, [containerWidth])

    // Update when the player plays (and therefore currentTime changes)
    useEffect(() => {
        const newTimelineStartTime =
            currentTime > 0 ? Math.floor(currentTime / renderConfig.duration) * renderConfig.duration : 0

        setRenderConfig({
            ...renderConfig,
            currentTime: currentTime,
            timelineStartTime: newTimelineStartTime,
        })
    }, [currentTime])

    useEffect(() => {
        setRenderConfigForZoom(INITIAL_ZOOM)
    }, [containerWidth, videoDuration])

    return { containerWidth, containerHeight, renderConfig, setRender: setRenderConfig, handleZoom, handleLaneClick }
}
