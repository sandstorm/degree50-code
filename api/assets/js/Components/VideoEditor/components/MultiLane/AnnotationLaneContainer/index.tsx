import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '..'
import { TabsTypesEnum } from 'types'
import { VideoEditorState, selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import AnnotationLane from './AnnotationLane'
import { CurrentEditorStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { selectUserCanEditSolution } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExerciseAndSolutionStore/ExercisePhaseTypesEnum'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice) => {
    const currentSolutionId = videoEditorSelectors.data.solutions.selectCurrentId(state)
    const isReadonly = !selectUserCanEditSolution(state, { solutionId: currentSolutionId })

    return {
        currentSolutionOwner: videoEditorSelectors.data.solutions.selectCurrentSolutionOwner(state),
        annotations: videoEditorSelectors.data.selectCurrentAnnotationsByStartTime(state),
        previousSolutions: videoEditorSelectors.selectActiveSolutionsWithAnnotations(state),
        exercisePhaseType: configSelectors.selectPhaseType(state),
        isSolutionView: configSelectors.selectIsSolutionView(state),
        isReadonly,
    }
}

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationLaneContainer = (props: Props) => {
    const componentName = getComponentName(TabsTypesEnum.VIDEO_ANNOTATIONS)

    if (!props.isSolutionView && props.exercisePhaseType === ExercisePhaseTypesEnum.VIDEO_ANALYSIS) {
        const ownerName = props.currentSolutionOwner.userName ?? '<Unbekannter Nutzer>'

        return (
            <div>
                <div className="multilane__medialane-description">
                    {componentName} ({props.annotations.length}) - {ownerName} [Aktuelle Lösung]
                </div>
                <AnnotationLane annotations={props.annotations} readOnly={props.isReadonly} />
            </div>
        )
    }

    return (
        <>
            {props.previousSolutions.map((solution) => (
                <div key={solution.id}>
                    <div className="multilane__medialane-description">
                        {componentName} ({solution.annotations.length}) - {solution.userName}
                    </div>
                    <AnnotationLane annotations={solution.annotations} readOnly />
                </div>
            ))}
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AnnotationLaneContainer))
