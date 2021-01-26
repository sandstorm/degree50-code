import { VideoCodePrototype } from 'Components/VideoEditor/VideoListsSlice'
import React, { useState, useCallback } from 'react'

export type Props = {
    createVideoCode: (videoCode: VideoCodePrototype, parentVideoCode?: VideoCodePrototype) => void
    parentVideoCode?: VideoCodePrototype
}

const AddVideoCodesForm = ({ createVideoCode, parentVideoCode }: Props) => {
    const [newVideoCodeName, setNewVideoCodeName] = useState('')
    const [newVideoCodeColor, setNewVideoCodeColor] = useState(parentVideoCode ? parentVideoCode.color : '#cccccc')

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

    const submitNewVideoCode = () => {
        const newVideoCode = {
            id: Date.now() + '_' + newVideoCodeColor,
            name: newVideoCodeName,
            description: '',
            color: newVideoCodeColor,
            userCreated: true,
            videoCodes: [],
        }

        createVideoCode(newVideoCode, parentVideoCode)
    }

    return (
        <div key={'new-video-code' + parentVideoCode?.id} className={'new-video-code'}>
            {parentVideoCode ? (
                <div className={'video-code__color'} style={{ backgroundColor: newVideoCodeColor }} />
            ) : (
                <input
                    value={newVideoCodeColor}
                    type={'color'}
                    className={'form-control form-control-sm'}
                    onChange={handleUpdateNewVideoCodeColor}
                />
            )}
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
        </div>
    )
}

export default AddVideoCodesForm
