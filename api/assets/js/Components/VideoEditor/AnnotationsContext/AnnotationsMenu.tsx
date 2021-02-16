import { actions, selectors as videoEditorSelectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ExercisePhaseTypesEnum'

const prefix = 'ANNOTATION'

export const AnnotationOverlayIds = {
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    const activePhaseType = configSelectors.selectPhaseType(state)
    const isSolutionView = configSelectors.selectIsSolutionView(state)

    const disableCreate = isSolutionView || activePhaseType === ExercisePhaseTypesEnum.VIDEO_CUTTING
    const disabled = isSolutionView && activePhaseType === ExercisePhaseTypesEnum.VIDEO_CUTTING

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

    return (
        <div className="video-editor__menu">
            {props.activeAnnotationCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeAnnotationCount}</div>
            )}
            <MenuButton icon={<i className="fas fa-pen" />} ariaLabel="Annotationen" disabled={props.disabled} pauseVideo>
                <MenuItem
                    ariaLabel={activeAnnotationsLabel}
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
                    ariaLabel={allAnnotationsLabel}
                    label={allAnnotationsLabel}
                    onClick={() => props.setOverlay({ overlayId: AnnotationOverlayIds.all, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationsMenu))
