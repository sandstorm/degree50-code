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

const prefix = 'ANNOTATION'

export const AnnotationOverlayIds = {
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice) => {
    const activePhaseType = configSelectors.selectPhaseType(state)
    const isSolutionView = configSelectors.selectIsSolutionView(state)
    const userIsCurrentEditor = selectUserIsCurrentEditor(state)
    const annotationsAreActive = configSelectors.selectAnnotationsAreActive(state)
    const dependsOnPreviousPhase = configSelectors.selectDependsOnPreviousPhase(state)

    const disableCreate =
        isSolutionView || activePhaseType !== ExercisePhaseTypesEnum.VIDEO_ANALYSIS || !userIsCurrentEditor
    const disabled =
        (!annotationsAreActive && !dependsOnPreviousPhase) ||
        (isSolutionView && activePhaseType !== ExercisePhaseTypesEnum.VIDEO_ANALYSIS)

    return {
        allAnnotationsCount: videoEditorSelectors.selectAllAnnotationIdsByStartTime(state).length,
        activeAnnotationCount: videoEditorSelectors.selectAllActiveAnnotationIdsAtCursor(state).length,
        disableCreate,
        disabled,
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementIndex: actions.overlay.setCurrentlyEditedElementId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationsMenu: FC<Props> = (props) => {
    const activeAnnotationsLabel = `Aktive Annotationen (${props.activeAnnotationCount})`
    const allAnnotationsLabel = `Alle Annotationen (${props.allAnnotationsCount})`
    const activeAnnotationsAriaLabel = `Aktive Annotationen (${props.activeAnnotationCount} aktive Annotationen)`
    const allAnnotationsAriaLabel = `Alle Annotationen (${props.allAnnotationsCount} Annotationen)`
    const menuButtonAriaLabel = `Annotationen (${props.activeAnnotationCount} aktive Annotationen)`

    return (
        <div className="video-editor__menu">
            {props.activeAnnotationCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeAnnotationCount}</div>
            )}
            <MenuButton
                icon={<i className="fas fa-pen" />}
                ariaLabel={menuButtonAriaLabel}
                disabled={props.disabled}
                pauseVideo
            >
                <MenuItem
                    ariaLabel={activeAnnotationsAriaLabel}
                    label={activeAnnotationsLabel}
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Erstelle Annotation"
                    label="Erstelle Annotation"
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.create, closeOthers: true })}
                    disabled={props.disableCreate}
                />
                <MenuItem
                    ariaLabel={allAnnotationsAriaLabel}
                    label={allAnnotationsLabel}
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.all, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationsMenu))
