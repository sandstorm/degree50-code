import React from 'react'
import { useAppSelector } from '../../../../Store/Store'
import { selectConfig, VideoCode as ConfigVideoCode } from '../../../Config/ConfigSlice'
import { MediaItem } from '../components/types'
import { MediaItemType, VideoCode } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSlice'

const renderVideoCodes = (videoCodes: ConfigVideoCode[], addVideoCode: (videoCode: ConfigVideoCode) => void) =>
    videoCodes.map((videoCode) => (
        <div
            className={'video-code'}
            key={videoCode.id}
            title={videoCode.description}
            style={{ backgroundColor: videoCode.color || '' }}
        >
            <button
                type="button"
                className={'btn btn-outline-dark'}
                onClick={() => {
                    addVideoCode(videoCode)
                }}
            >
                <i className={'fas fa-plus'}></i>
            </button>
            <span>{videoCode.name}</span>
        </div>
    ))

export type Props = {
    addVideoCode: (index: number, videoCode: ConfigVideoCode) => void
    videoCodes: MediaItem<VideoCode>[]
}

// Renders a list of configured video codes.
// These are not yet part of the ReadOnlyMediaTrack.
// Be pressing the add button on these codes, students can add them
// to the media track, to arrange them.
const VideoCode = ({ videoCodes, addVideoCode }: Props) => {
    const config = useAppSelector(selectConfig)

    const handleAdd = (videoCode: ConfigVideoCode) => {
        addVideoCode(videoCodes.length, videoCode)
    }

    const hasNoVideoCodes = config.videoCodes.length === 0

    if (hasNoVideoCodes) {
        return (
            <div className="video-editor__video-codes">
                <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                    <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
                </div>
            </div>
        )
    }

    return <div className="video-editor__video-codes">{renderVideoCodes(config.videoCodes, handleAdd)}</div>
}

export default VideoCode
