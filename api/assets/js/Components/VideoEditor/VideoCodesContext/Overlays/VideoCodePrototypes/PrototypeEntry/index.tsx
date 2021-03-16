import React, { useState, useCallback, FC, memo } from 'react'
import { connect } from 'react-redux'
import PrototypeList from '../PrototypeList'
import ToggleChildrenButton from './ToggleChildrenButton'
import PrototypeName from './PrototypeName'
import Color from './Color'
import RemoveButton from './RemoveButton'
import { VideoCodePrototype } from 'Components/VideoEditor/types'
import ChildPrototypeCount from './ChildPrototypeCount'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from 'Components/VideoEditor/VideoCodesContext/VideoCodesMenu'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'

// FIXME
// We should probably find a way to remove the circular dependency between
// the prototypeList and entry, because it's rather confusing to read.

const mapDispatchToProps = {
    openOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setCurrentlyEditedElementParentId: actions.overlay.setCurrentlyEditedElementParentId,
}

export type OwnProps = {
    videoCodePrototype: VideoCodePrototype
}

type Props = OwnProps & typeof mapDispatchToProps

const PrototypeEntry: FC<Props> = (props) => {
    const [showChildren, setShowChildren] = useState(false)

    const toggleChildrenVisibility = useCallback(() => {
        setShowChildren(!showChildren)
    }, [setShowChildren, showChildren])

    const description = `
        ${props.videoCodePrototype.userCreated ? 'Selbst erstellter Code' : 'Vordefinierter Code'}
        name: ${props.videoCodePrototype.name}
        ${props.videoCodePrototype.description && `description: ${props.videoCodePrototype.description}`}
        ${props.videoCodePrototype.videoCodes.length > 0 ? 'Hat' : 'Hat keine'} Untercodes
    `

    const handleEdit = () => {
        props.setCurrentlyEditedElementId(props.videoCodePrototype.id)
        props.setCurrentlyEditedElementParentId(props.videoCodePrototype.parentId)
        props.openOverlay({ overlayId: VideoCodeOverlayIds.editPrototype, closeOthers: false })
    }

    const handleRemove = () => {
        props.setCurrentlyEditedElementId(props.videoCodePrototype.id)
        props.setCurrentlyEditedElementParentId(undefined)
        props.openOverlay({ overlayId: VideoCodeOverlayIds.removePrototype, closeOthers: false })
    }

    return (
        <li tabIndex={0} aria-label={description} className="video-code" title={props.videoCodePrototype.description}>
            <div className={'video-code__content'}>
                <Color color={props.videoCodePrototype.color} />

                <PrototypeName name={props.videoCodePrototype.name} />

                {props.videoCodePrototype.parentId === undefined && (
                    <ChildPrototypeCount count={props.videoCodePrototype.videoCodes.length} />
                )}

                {props.videoCodePrototype.userCreated ? (
                    <>
                        <Button
                            className={'btn btn-outline-primary btn-sm'}
                            aria-label={'Code Editieren'}
                            onPress={handleEdit}
                        >
                            <i className={'fas fa-pen'} />
                        </Button>
                        <RemoveButton onClick={handleRemove} />
                    </>
                ) : (
                    <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
                )}

                {!props.videoCodePrototype.parentId ? (
                    <ToggleChildrenButton onClick={toggleChildrenVisibility} showChildren={showChildren} />
                ) : null}
            </div>

            {showChildren ? (
                <PrototypeList
                    videoCodePrototypes={props.videoCodePrototype.videoCodes}
                    parentPrototype={props.videoCodePrototype}
                />
            ) : null}
        </li>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(PrototypeEntry))
