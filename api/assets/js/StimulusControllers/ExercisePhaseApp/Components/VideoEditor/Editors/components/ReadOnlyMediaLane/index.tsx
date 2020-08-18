import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReadOnlyMediaItems from './ReadOnyMediaItems'
import { MediaItem } from '../types'
import ReadOnlyMediaTrack from '../MediaLane/MediaTrack/index'
import { RenderConfig } from '../MediaLane/MediaTrack'
import MediaTrackInteractionArea from '../MediaLane/MediaTrackInteractionArea'
import { MediaItemType } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'
import { useDimensions } from '../MediaLane/utils'

type Props = {
    currentTime: number
    currentZoom: number
    updateCurrentTime: (time: number) => void
    mediaItems: MediaItem<MediaItemType>[]
    amountOfLanes: number
    videoDuration: number
}

const initialRender: RenderConfig = {
    padding: 5,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
}

const ReadOnlyMediaLane = ({
    currentTime,
    currentZoom,
    updateCurrentTime,
    mediaItems,
    amountOfLanes,
    videoDuration,
}: Props) => {
    // TODO this should later become part of the api and probably the redux store
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)
    const mediaTrackConfig = {} // TODO
    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { containerWidth, containerHeight } = useDimensions({
        setRender,
        $container,
        renderConfig,
        currentTime,
    })

    const getDurationForRenderConfig = (durationInPercentage: number) => {
        return Math.round((videoDuration / 100) * durationInPercentage)
    }

    initialRender.duration = getDurationForRenderConfig(currentZoom)
    initialRender.gridNum = initialRender.duration * 10 + initialRender.padding * 2
    initialRender.gridGap = containerWidth / initialRender.gridNum

    useEffect(() => {
        const newDuration = getDurationForRenderConfig(currentZoom)
        const newGridNum = newDuration * 10 + renderConfig.padding * 2
        const newGridGap = containerWidth / newGridNum

        setRender({
            ...renderConfig,
            duration: newDuration,
            gridNum: newGridNum,
            gridGap: newGridGap,
        })
    }, [currentZoom])

    const handleLaneClick = useCallback(
        (clickTime) => {
            const newCurrentTime = clickTime >= 0 ? clickTime : 0
            updateCurrentTime(newCurrentTime)
        },
        [updateCurrentTime]
    )

    return (
        <div className="video-editor-timeline">
            <div className="video-editor-timeline__body">
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
                    videoDuration={videoDuration}
                />

                <ReadOnlyMediaItems renderConfig={renderConfig} mediaItems={mediaItems} amountOfLanes={amountOfLanes} />
            </div>
        </div>
    )
}

export default ReadOnlyMediaLane
