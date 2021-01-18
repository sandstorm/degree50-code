import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import MenuButton from '../MenuButton'
import MenuItem from '../MenuItem'

export const AnnotationOverlayIds = {
    active: 'active',
    create: 'create',
    all: 'all',
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    setOverlay: (id: string) => dispatch(actions.overlay.setOverlay(id)),
})

type Props = ReturnType<typeof mapDispatchToProps>

const AnnotationsMenu: FC<Props> = (props) => {
    return (
        <MenuButton label="Annotationen">
            <MenuItem label="Aktive Einträge" onClick={() => props.setOverlay(AnnotationOverlayIds.active)} />
            <MenuItem label="Erstelle Eintrag" onClick={() => props.setOverlay(AnnotationOverlayIds.create)} />
            <MenuItem label="Alle Einträge" onClick={() => props.setOverlay(AnnotationOverlayIds.all)} />
        </MenuButton>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(AnnotationsMenu))
