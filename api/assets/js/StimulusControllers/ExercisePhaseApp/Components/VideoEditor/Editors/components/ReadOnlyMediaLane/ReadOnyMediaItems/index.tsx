import React, { useRef } from 'react'
import ReadOnlyMediaItem from './ReadOnlyMediaItem'
import { MediaItem } from '../../types'
import { RenderConfig } from '../../MediaLane/MediaTrack'
import { MediaItemType } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'

const renderItems = (mediaItems: MediaItem<MediaItemType>[], renderConfig: RenderConfig, amountOfLanes: number) =>
    mediaItems.map((item, index) => {
        return (
            <ReadOnlyMediaItem
                key={index}
                id={index}
                item={item}
                renderConfig={renderConfig}
                amountOfLanes={amountOfLanes}
            />
        )
    })

type Props = {
    mediaItems: MediaItem<MediaItemType>[]
    renderConfig: RenderConfig
    amountOfLanes: number
}

const ReadOnlyMediaItems = ({ mediaItems, renderConfig, amountOfLanes }: Props) => {
    const $mediaItemsRef: React.RefObject<HTMLDivElement> = useRef(null)

    return (
        <div className="video-editor__media-items">
            <div ref={$mediaItemsRef}>{renderItems(mediaItems, renderConfig, amountOfLanes)}</div>
        </div>
    )
}

export default React.memo(ReadOnlyMediaItems)
