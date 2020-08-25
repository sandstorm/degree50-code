import { useState, useLayoutEffect, useEffect } from 'react'
import { RenderConfig } from './MediaTrack'
import { useWindowSize } from './MediaTrack/hooks'

export const useMediaLane = ({
    setRender,
    $container,
    renderConfig,
    currentTime,
    videoDuration,
}: {
    setRender: React.Dispatch<React.SetStateAction<RenderConfig>>
    $container: React.RefObject<HTMLDivElement>
    renderConfig: RenderConfig
    currentTime: number
    videoDuration: number
}) => {
    const [containerWidth, setContainerWidth] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)
    const windowSize = useWindowSize()

    const updateContainerDimensions = () => {
        if ($container.current) {
            const containerWidth = $container.current.clientWidth
            const newGridGap = containerWidth / renderConfig.gridNum

            setRender({
                ...renderConfig,
                gridGap: newGridGap,
            })

            setContainerWidth(containerWidth)
            setContainerHeight($container.current.clientHeight)
        }
    }

    const getDurationForRenderConfig = (durationInPercentage: number) => {
        return Math.round((videoDuration / 100) * durationInPercentage)
    }

    const getRenderConfigForZoom = (zoomInPercent: number) => {
        const newDuration = getDurationForRenderConfig(zoomInPercent)
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

        return {
            duration: newDuration,
            gridNum: newGridNum,
            gridGap: newGridGap,
            timelineStartTime: newTimelineStartTime,
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
        const newTimelineStartTime =
            currentTime > 0 ? Math.floor(currentTime / renderConfig.duration) * renderConfig.duration : 0

        setRender({
            ...renderConfig,
            currentTime: currentTime,
            timelineStartTime: newTimelineStartTime,
        })
    }, [currentTime])

    return { containerWidth, containerHeight, getDurationForRenderConfig, getRenderConfigForZoom }
}
