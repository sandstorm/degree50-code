import React from 'react'
import { MediaItem } from '../../types'
import { RenderConfig } from '../../MediaLane/MediaTrack'
import { MediaItemType } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'

type Props = {
    item: MediaItem<MediaItemType>
    id: number
    renderConfig: RenderConfig
    gridGap: number
    amountOfLanes?: number
}

const ReadOnlyMediaItem = ({ item, id, renderConfig, gridGap, amountOfLanes = 0 }: Props) => {
    const mediaItemHeight = 100 / (amountOfLanes + 1)

    return (
        <div
            className={['video-editor__media-items__item'].join(' ').trim()}
            key={id}
            style={{
                backgroundColor: item.color ? item.color : '',
                left: renderConfig.padding * gridGap + (item.startTime - renderConfig.timelineStartTime) * gridGap * 10,
                width: (item.endTime - item.startTime) * gridGap * 10,
                top: item.lane * mediaItemHeight + '%',
                height: mediaItemHeight + '%',
            }}
        >
            <div className="video-editor__media-items__text">
                {item.text.split(/\r?\n/).map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
    )
}

export default React.memo(ReadOnlyMediaItem)
