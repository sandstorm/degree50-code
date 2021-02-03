import React, { useState, useCallback } from 'react'
import VideoCodesList from '../VideoCodesList'
import AddVideoCodePrototypeForm from './AddVideoCodePrototypeForm'
import ToggleChildrenButton from './ToggleChildrenButton'
import VideoCodeName from './VideoCodeName'
import Color from './Color'
import RemoveButton from './RemoveButton'
import { VideoCodePrototype } from 'Components/VideoEditor/types'

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

    const description = `
        ${videoCode.userCreated ? 'Selbst erstellter Code' : 'Vordefinierter Code'}
        name: ${videoCode.name}
        ${videoCode.description && `description: ${videoCode.description}`}
        ${videoCode.videoCodes.length > 0 ? 'Hat' : 'Hat keine'} Untercodes
    `

    return (
        <li tabIndex={0} aria-label={description} className="video-code" title={videoCode.description}>
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

            {showChildren ? (
                <VideoCodesList
                    videoCodesPool={videoCode.videoCodes}
                    showCreateVideoCodeForm={false}
                    parentVideoCode={videoCode}
                />
            ) : null}

            {showChildren && showCreateVideoCodeForm ? (
                <AddVideoCodePrototypeForm
                    createVideoCodePrototype={createVideoCodePrototype}
                    parentVideoCode={videoCode}
                />
            ) : null}
        </li>
    )
}

export default VideoCodeEntry
