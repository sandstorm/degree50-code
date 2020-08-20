import { useState, useLayoutEffect, useEffect } from 'react'
import { RenderConfig } from './MediaTrack'
import { useWindowSize } from './MediaTrack/hooks'

export const useDimensions = ({
    setRender,
    $container,
    renderConfig,
    currentTime,
}: {
    setRender: React.Dispatch<React.SetStateAction<RenderConfig>>
    $container: React.RefObject<HTMLDivElement>
    renderConfig: RenderConfig
    currentTime: number
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

    return { containerWidth, containerHeight }
}
