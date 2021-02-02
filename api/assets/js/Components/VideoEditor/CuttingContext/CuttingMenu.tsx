import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'

const prefix = 'CUT'

export const CutOverlayIds = {
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    allByCutOrder: `${prefix}/allByCutOrder`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    return {
        activeCutCount: selectors.selectActiveCutIds(state).length,
        cutsAreActive: selectors.config.selectCutsAreActive(state),
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementIndex: actions.overlay.setCurrentlyEditedElementId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutsMenu: FC<Props> = (props) => {
    return (
        <div className="video-editor__menu">
            {props.activeCutCount > 0 && <div className="video-editor__menu__count-badge">{props.activeCutCount}</div>}
            <MenuButton icon={<i className="fas fa-cut" />} disabled={!props.cutsAreActive} ariaLabel="Schnitte">
                <MenuItem
                    label="Aktive Schnitte"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    label="Erstelle Schnitt"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.create, closeOthers: true })}
                />
                <MenuItem
                    label="Alle Schnitte"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.all, closeOthers: true })}
                />
                <MenuItem
                    label="Schnittreihenfolge"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.allByCutOrder, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutsMenu))
