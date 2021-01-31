import React, { useState, useCallback } from 'react'
import VideoCodesList from '../VideoCodesList'
import AddVideoCodePrototypeForm from './AddVideoCodePrototypeForm'
import { VideoCodePrototype } from 'Components/VideoEditor/VideoListsSlice'
import ToggleChildrenButton from './ToggleChildrenButton'
import VideoCodeName from './VideoCodeName'
import Color from './Color'
import RemoveButton from './RemoveButton'

export type Props = {
    videoCode: VideoCodePrototype
    removeVideoCodePrototype: (prototypeId: string) => void
    createVideoCodePrototype: (prototype: VideoCodePrototype) => void
    showCreateVideoCodeForm: boolean
}

const VideoCodeEntry = ({
    videoCode,
    removeVideoCodePrototype,
    createVideoCodePrototype,
    showCreateVideoCodeForm,
}: Props) => {
    const [showChildren, setShowChildren] = useState(false)

    const toggleChildrenVisibility = useCallback(() => {
        setShowChildren(!showChildren)
    }, [setShowChildren, showChildren])

    return (
        <li
            className={showChildren ? 'video-code video-code--show-children' : 'video-code'}
            title={videoCode.description}
        >
            <div className={'video-code__content'}>
                <Color color={videoCode.color} />

                <VideoCodeName name={videoCode.name} />

                {videoCode.userCreated ? (
                    <RemoveButton onClick={() => removeVideoCodePrototype(videoCode.id)} />
                ) : (
                    <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
                )}

                {showCreateVideoCodeForm ? (
                    <ToggleChildrenButton onClick={toggleChildrenVisibility} showChildren={showChildren} />
                ) : null}
            </div>

            <VideoCodesList
                videoCodesPool={videoCode.videoCodes}
                showCreateVideoCodeForm={false}
                parentVideoCode={videoCode}
            />

            {showCreateVideoCodeForm ? (
                <AddVideoCodePrototypeForm
                    createVideoCodePrototype={createVideoCodePrototype}
                    parentVideoCode={videoCode}
                />
            ) : (
                ''
            )}
        </li>
    )
}

export default VideoCodeEntry
