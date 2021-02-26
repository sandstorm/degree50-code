import { actions, selectors as videoEditorSelectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'
import { CurrentEditorStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { selectUserIsCurrentEditor } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExerciseAndSolutionStore/ExercisePhaseTypesEnum'

const prefix = 'CUT'

export const CutOverlayIds = {
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    allByCutOrder: `${prefix}/allByCutOrder`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
    cutPreview: `${prefix}/cutPreview`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice) => {
    const activePhaseType = configSelectors.selectPhaseType(state)
    const isSolutionView = configSelectors.selectIsSolutionView(state)
    const userIsCurrentEditor = selectUserIsCurrentEditor(state)
    const cutsAreActive = configSelectors.selectCutsAreActive(state)

    const disableCreate =
        isSolutionView || activePhaseType !== ExercisePhaseTypesEnum.VIDEO_CUTTING || !userIsCurrentEditor
    const disabled = !cutsAreActive

    return {
        allCutsCount: videoEditorSelectors.selectAllCutIdsByStartTime(state).length,
        activeCutCount: videoEditorSelectors.selectCurrentCutIdsAtCursor(state).length,
        disableCreate,
        disabled,
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementIndex: actions.overlay.setCurrentlyEditedElementId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutsMenu: FC<Props> = (props) => {
    const allCutsLabel = `Alle Schnitte (${props.allCutsCount})`
    const activeCutsLabel = `Aktive Schnitte (${props.activeCutCount})`

    return (
        <div className="video-editor__menu">
            {props.activeCutCount > 0 && <div className="video-editor__menu__count-badge">{props.activeCutCount}</div>}
            <MenuButton icon={<i className="fas fa-cut" />} ariaLabel="Schnitte" pauseVideo disabled={props.disabled}>
                <MenuItem
                    ariaLabel={activeCutsLabel}
                    label={activeCutsLabel}
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Erstelle Schnitt"
                    label="Erstelle Schnitt"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.create, closeOthers: true })}
                    disabled={props.disableCreate}
                />
                <MenuItem
                    ariaLabel={allCutsLabel}
                    label={allCutsLabel}
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.all, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Schnittreihenfolge"
                    label="Schnittreihenfolge"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.allByCutOrder, closeOthers: true })}
                    disabled={props.disableCreate}
                />
                <MenuItem
                    ariaLabel="Schnitt Vorschau"
                    label="Schnitt Vorschau"
                    onClick={() => props.setOverlay({ overlayId: CutOverlayIds.cutPreview, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutsMenu))
