import { VideoCodePrototype } from 'Components/VideoEditor/types'
import React, { useState, useCallback } from 'react'
import { generate } from 'shortid'

export type Props = {
    createVideoCodePrototype: (videoCode: VideoCodePrototype) => void
    parentVideoCode?: VideoCodePrototype
}

const AddVideoCodePrototypeForm = ({ createVideoCodePrototype: createVideoCode, parentVideoCode }: Props) => {
    const [newVideoCodePrototypeName, setNewVideoCodePrototypeName] = useState('')
    const [newPrototypeColor, setNewPrototypeColor] = useState(parentVideoCode ? parentVideoCode.color : '#cccccc')

    const handleUpdatePrototypeName = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setNewVideoCodePrototypeName(event.target.value)
        },
        [setNewVideoCodePrototypeName]
    )

    const handleUpdatePrototypeColor = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setNewPrototypeColor(event.target.value)
        },
        [setNewPrototypeColor]
    )

    const submitNewPrototype = () => {
        const newPrototype: VideoCodePrototype = {
            id: generate(),
            name: newVideoCodePrototypeName,
            description: '',
            color: newPrototypeColor,
            userCreated: true,
            parentId: parentVideoCode?.id,
            videoCodes: [],
        }

        createVideoCode(newPrototype)

        setNewVideoCodePrototypeName('')
    }

    return (
        <div
            tabIndex={0}
            aria-label="Neuen Code Erstellen"
            key={'new-video-code' + parentVideoCode?.id}
            className={'new-video-code'}
        >
            {parentVideoCode ? (
                <div className={'video-code__color'} style={{ backgroundColor: newPrototypeColor }} />
            ) : (
                <input
                    value={newPrototypeColor}
                    type={'color'}
                    className={'form-control form-control-sm'}
                    onChange={handleUpdatePrototypeColor}
                />
            )}
            <input
                type={'text'}
                placeholder={'Name für neuen Videocode'}
                className={'form-control form-control-sm'}
                onChange={handleUpdatePrototypeName}
                value={newVideoCodePrototypeName}
            />
            <button
                title={'Video-Code erstellen'}
                className={'btn btn-primary btn-sm'}
                onClick={submitNewPrototype}
                disabled={!newVideoCodePrototypeName}
            >
                <i className={'fas fa-plus'} />
            </button>
        </div>
    )
}

export default AddVideoCodePrototypeForm
