import React, { useState, useCallback, FC, memo } from 'react'
import { connect } from 'react-redux'
import VideoCodesList from '../VideoCodesList'
import ToggleChildrenButton from './ToggleChildrenButton'
import VideoCodeName from './VideoCodeName'
import Color from './Color'
import RemoveButton from './RemoveButton'
import { VideoCodePrototype } from 'Components/VideoEditor/types'
import ChildCodeCount from './ChildCodeCount'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from 'Components/VideoEditor/VideoCodesContext/VideoCodesMenu'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'

const mapDispatchToProps = {
    openOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setCurrentlyEditedElementParentId: actions.overlay.setCurrentlyEditedElementParentId,
}

export type OwnProps = {
    videoCode: VideoCodePrototype
    removeVideoCodePrototype: (prototypeId: string) => void
    createVideoCodePrototype: (prototype: VideoCodePrototype) => void
}

type Props = OwnProps & typeof mapDispatchToProps

const VideoCodeEntry: FC<Props> = (props) => {
    const [showChildren, setShowChildren] = useState(false)

    const toggleChildrenVisibility = useCallback(() => {
        setShowChildren(!showChildren)
    }, [setShowChildren, showChildren])

    const description = `
        ${props.videoCode.userCreated ? 'Selbst erstellter Code' : 'Vordefinierter Code'}
        name: ${props.videoCode.name}
        ${props.videoCode.description && `description: ${props.videoCode.description}`}
        ${props.videoCode.videoCodes.length > 0 ? 'Hat' : 'Hat keine'} Untercodes
    `

    const handleEdit = () => {
        props.setCurrentlyEditedElementId(props.videoCode.id)
        props.setCurrentlyEditedElementParentId(props.videoCode.parentId)
        props.openOverlay({ overlayId: VideoCodeOverlayIds.editCode, closeOthers: false })
    }

    return (
        <li tabIndex={0} aria-label={description} className="video-code" title={props.videoCode.description}>
            <div className={'video-code__content'}>
                <Color color={props.videoCode.color} />

                <VideoCodeName name={props.videoCode.name} />

                {props.videoCode.parentId === undefined && <ChildCodeCount count={props.videoCode.videoCodes.length} />}

                {props.videoCode.userCreated ? (
                    <>
                        <Button
                            className={'btn btn-outline-primary btn-sm'}
                            aria-label={'Code Editieren'}
                            onPress={handleEdit}
                        >
                            <i className={'fas fa-pen'} />
                        </Button>
                        <RemoveButton onClick={() => props.removeVideoCodePrototype(props.videoCode.id)} />
                    </>
                ) : (
                    <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
                )}

                {props.videoCode.parentId === undefined ? (
                    <ToggleChildrenButton onClick={toggleChildrenVisibility} showChildren={showChildren} />
                ) : null}
            </div>

            {showChildren ? (
                <VideoCodesList videoCodesPool={props.videoCode.videoCodes} parentVideoCode={props.videoCode} />
            ) : null}
        </li>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(VideoCodeEntry))
