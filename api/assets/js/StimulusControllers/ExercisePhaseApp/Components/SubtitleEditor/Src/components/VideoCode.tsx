import React from 'react'
import { useAppSelector } from '../../../../Store/Store'
import { selectConfig, VideoCode } from '../../../Config/ConfigSlice'
import { Subtitle } from '../../SubtitleEditor'

export type Props = {
    addVideoCode: (index: number, videoCode: VideoCode) => void
    subtitles: Subtitle[]
}

const VideoCode = (props: Props) => {
    const config = useAppSelector(selectConfig)

    const addVideoCode = (videoCode: VideoCode) => {
        props.addVideoCode(props.subtitles.length, videoCode)
    }

    let videoCodes = null
    if (config.videoCodes.length === 0) {
        videoCodes = (
            <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
            </div>
        )
    } else {
        videoCodes = config.videoCodes.map((videoCode) => (
            <div
                className={'video-code'}
                key={videoCode.id}
                title={videoCode.description}
                style={{ backgroundColor: videoCode.color }}
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
    }

    return <div className="subtitle-editor__video-codes">{videoCodes}</div>
}

export default VideoCode
