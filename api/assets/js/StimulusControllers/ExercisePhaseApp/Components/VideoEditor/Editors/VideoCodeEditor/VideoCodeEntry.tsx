import React, { useState, useCallback } from 'react'
import { VideoCodePrototype } from '../../../Config/ConfigSlice'
import VideoCodesList from './VideoCodesList'
import AddVideoCodesForm from './AddVideoCodesForm'

export type Props = {
    videoCode: VideoCodePrototype
    removeVideoCode: (videoCode: VideoCodePrototype) => void
    addVideoCode: (videoCode: VideoCodePrototype) => void
    createVideoCode: (videoCode: VideoCodePrototype, parentVideoCode?: VideoCodePrototype) => void
    showCreateVideoCodeForm: boolean
}

const VideoCodeEntry = ({
    videoCode,
    removeVideoCode,
    addVideoCode,
    createVideoCode,
    showCreateVideoCodeForm,
}: Props) => {
    const [showChildren, setShowChildren] = useState(false)

    const toggleChildrenVisibility = useCallback(
        (showChildren: boolean) => {
            setShowChildren(showChildren)
        },
        [setShowChildren]
    )

    return (
        <li
            className={showChildren ? 'video-code video-code--show-children' : 'video-code'}
            key={videoCode.id}
            title={videoCode.description}
        >
            <div className={'video-code__content'}>
                <div className={'video-code__color'} style={{ backgroundColor: videoCode.color || '' }} />
                <span>{videoCode.name}</span>
                {videoCode.userCreated ? (
                    <button
                        type="button"
                        className={'btn btn-outline-danger btn-sm'}
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
                {showCreateVideoCodeForm ? (
                    <button
                        type="button"
                        className={'btn btn-outline-primary btn-sm'}
                        onClick={() => {
                            toggleChildrenVisibility(!showChildren)
                        }}
                    >
                        <i className={showChildren ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} />
                    </button>
                ) : (
                    ''
                )}
            </div>
            <VideoCodesList
                videoCodesPool={videoCode.videoCodes}
                addVideoCode={addVideoCode}
                removeVideoCode={removeVideoCode}
                createVideoCode={createVideoCode}
                showCreateVideoCodeForm={false}
                parentVideoCode={videoCode}
            />
            {showCreateVideoCodeForm ? (
                <AddVideoCodesForm createVideoCode={createVideoCode} parentVideoCode={videoCode} />
            ) : (
                ''
            )}
        </li>
    )
}

export default VideoCodeEntry
