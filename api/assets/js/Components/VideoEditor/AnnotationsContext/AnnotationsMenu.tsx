import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'

const prefix = 'ANNOTATION'

export const AnnotationOverlayIds = {
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    return {
        activeAnnotationCount: selectors.selectActiveAnnotationIds(state).length,
        annotationsAreActive: selectors.config.selectAnnotationsAreActive(state),
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementIndex: actions.overlay.setCurrentlyEditedElementId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationsMenu: FC<Props> = (props) => {
    return (
        <div className="video-editor__menu">
            {props.annotationsAreActive && props.activeAnnotationCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeAnnotationCount}</div>
            )}
            <MenuButton icon={<i className="fas fa-pen" />} disabled={!props.annotationsAreActive}>
                <MenuItem
                    label="Aktive Annotationen"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    label="Erstelle Annotation"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.create, closeOthers: true })}
                />
                <MenuItem
                    label="Alle Annotationen"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.all, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationsMenu))
