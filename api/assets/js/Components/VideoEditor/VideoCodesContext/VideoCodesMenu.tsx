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

const prefix = 'VIDEO_CODE'
export const VideoCodeOverlayIds = {
    list: `{$prefix}/list`,
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    editPrototype: `${prefix}/editPrototype`,
    remove: `${prefix}/remove`,
    removePrototype: `${prefix}/removePrototype`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice) => {
    const activePhaseType = configSelectors.selectPhaseType(state)
    const isSolutionView = configSelectors.selectIsSolutionView(state)
    const userIsCurrentEditor = selectUserIsCurrentEditor(state)
    const videoCodesAreActive = configSelectors.selectVideoCodesAreActive(state)
    const dependsOnPreviousPhase = configSelectors.selectDependsOnPreviousPhase(state)

    const disableCreate =
        isSolutionView || activePhaseType !== ExercisePhaseTypesEnum.VIDEO_ANALYSIS || !userIsCurrentEditor
    const disabled =
        (!videoCodesAreActive && !dependsOnPreviousPhase) ||
        (isSolutionView && activePhaseType !== ExercisePhaseTypesEnum.VIDEO_ANALYSIS)

    return {
        allVideoCodesCount: videoEditorSelectors.selectAllVideoCodeIdsByStartTime(state).length,
        activeVideoCodeCount: videoEditorSelectors.selectAllActiveVideoCodeIdsAtCursor(state).length,
        disableCreate,
        disabled,
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementIndex: actions.overlay.setCurrentlyEditedElementId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const VideoCodesMenu: FC<Props> = (props) => {
    const activeCodesAriaLabel = `Aktive Codierungen (${props.activeVideoCodeCount} aktive Codierungen)`
    const allCodesAriaLabel = `Alle Codierungen (${props.allVideoCodesCount} Codierungen)`
    const activeCodesLabel = `Aktive Codierungen (${props.activeVideoCodeCount})`
    const allCodesLabel = `Alle Codierungen (${props.allVideoCodesCount})`
    const menuButtonAriaLabel = `Codierungen (${props.activeVideoCodeCount} aktive Codierungen)`

    return (
        <div className="video-editor__menu">
            {props.activeVideoCodeCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeVideoCodeCount}</div>
            )}
            <MenuButton
                icon={<i className="fa fa-tag" />}
                ariaLabel={menuButtonAriaLabel}
                disabled={props.disabled}
                pauseVideo
            >
                <MenuItem
                    ariaLabel={activeCodesAriaLabel}
                    label={activeCodesLabel}
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Erstelle Codierung"
                    label="Erstelle Codierung"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.create, closeOthers: true })}
                    disabled={props.disableCreate}
                />
                <MenuItem
                    ariaLabel={allCodesAriaLabel}
                    label={allCodesLabel}
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.all, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Code-Liste"
                    label="Code-Liste"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.list, closeOthers: true })}
                    disabled={props.disableCreate}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(VideoCodesMenu))
