import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import MenuButton from '../MenuButton'
import MenuItem from '../MenuItem'

export const AnnotationOverlayIds = {
    active: 'active',
    create: 'create',
    all: 'all',
    edit: 'edit',
    remove: 'remove',
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
        <div className="video-editor__annotation-menu">
            {props.activeAnnotationCount > 0 && (
                <div className="video-editor__annotation-menu__count-badge">{props.activeAnnotationCount}</div>
            )}
            <MenuButton label="Annotationen">
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
