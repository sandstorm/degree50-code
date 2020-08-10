import React, { useState, useCallback } from 'react'
import { VideoCodePrototype } from '../../../Config/ConfigSlice'

const renderVideoCodes = (
    videoCodes: VideoCodePrototype[],
    addVideoCode: (videoCode: VideoCodePrototype) => void,
    removeVideoCode: (videoCode: VideoCodePrototype) => void
) =>
    videoCodes.map((videoCode) => (
        <li className={'video-code'} key={videoCode.id} title={videoCode.description}>
            <div className={'video-code__color'} style={{ backgroundColor: videoCode.color || '' }} />
            <span>{videoCode.name}</span>
            {videoCode.userCreated ? (
                <button
                    type="button"
                    className={'btn btn-outline-primary btn-sm'}
                    title={'Video-Code löschen'}
                    onClick={() => {
                        removeVideoCode(videoCode)
                    }}
                >
                    <i className={'fas fa-trash'} />
                </button>
            ) : (
                <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
            )}
            <button
                type="button"
                className={'btn btn-outline-primary btn-sm'}
                title={'Video-Code hinzufügen'}
                onClick={() => {
                    addVideoCode(videoCode)
                }}
            >
                <i className={'fas fa-plus'} />
            </button>
        </li>
    ))

export type Props = {
    addVideoCode: (videoCode: VideoCodePrototype) => void
    removeVideoCode: (videoCode: VideoCodePrototype) => void
    createVideoCode: (videoCode: VideoCodePrototype) => void
    videoCodesPool: Array<VideoCodePrototype>
}

// Renders a list of configured video codes.
// These are not yet part of the ReadOnlyMediaTrack.
// Be pressing the add button on these codes, students can add them
// to the media track, to arrange them.
const VideoCode = ({ addVideoCode, removeVideoCode, createVideoCode, videoCodesPool }: Props) => {
    const [newVideoCodeName, setNewVideoCodeName] = useState('')
    const [newVideoCodeColor, setNewVideoCodeColor] = useState('#cccccc')

    const handleUpdateNewVideoCodeName = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setNewVideoCodeName(event.target.value)
        },
        [setNewVideoCodeName]
    )

    const handleUpdateNewVideoCodeColor = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setNewVideoCodeColor(event.target.value)
        },
        [setNewVideoCodeColor]
    )

    const hasNoVideoCodes = videoCodesPool.length === 0

    if (hasNoVideoCodes) {
        return (
            <div className="video-editor__video-codes">
                <div className={'video-code'} style={{ backgroundColor: '#ccc' }}>
                    <span>Es stehen keine Video-Codes zur Auswahl für diese Aufgabe</span>
                </div>
            </div>
        )
    }

    const submitNewVideoCode = () => {
        const newVideoCode = {
            id: Date.now() + '_' + newVideoCodeColor,
            name: newVideoCodeName,
            description: '',
            color: newVideoCodeColor,
            userCreated: true,
        }

        createVideoCode(newVideoCode)
    }

    return (
        <ul className="video-editor__video-codes">
            {renderVideoCodes(videoCodesPool, addVideoCode, removeVideoCode)}
            <li className={'new-video-code'}>
                <input
                    value={newVideoCodeColor}
                    type={'color'}
                    className={'form-control form-control-sm'}
                    onChange={handleUpdateNewVideoCodeColor}
                />
                <input
                    type={'text'}
                    placeholder={'Name für neuen Videocode'}
                    className={'form-control form-control-sm'}
                    onChange={handleUpdateNewVideoCodeName}
                />
                <button
                    title={'Video-Code erstellen'}
                    className={'btn btn-primary btn-sm'}
                    onClick={submitNewVideoCode}
                    disabled={!newVideoCodeName}
                >
                    <i className={'fas fa-plus'} />
                </button>
            </li>
        </ul>
    )
}

export default VideoCode
