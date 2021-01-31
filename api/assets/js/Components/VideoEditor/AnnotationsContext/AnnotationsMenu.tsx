import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import MenuButton from '../Toolbar/MenuButton'
import MenuItem from '../Toolbar/MenuItem'

const prefix = 'ANNOTATION'

export const AnnotationOverlayIds = {
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        activeAnnotationCount: selectors.selectActiveAnnotationIds(state).length,
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
            {props.activeAnnotationCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeAnnotationCount}</div>
            )}
            <MenuButton icon={<i className="fas fa-pen" />}>
                <MenuItem
                    label="Aktive Einträge"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    label="Erstelle Eintrag"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.create, closeOthers: true })}
                />
                <MenuItem
                    label="Alle Einträge"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.all, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationsMenu))
