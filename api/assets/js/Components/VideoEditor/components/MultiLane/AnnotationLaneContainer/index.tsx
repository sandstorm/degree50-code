import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '..'
import { TabsTypesEnum } from 'types'
import { VideoEditorState, selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ExercisePhaseTypesEnum'
import AnnotationLane from './AnnotationLane'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    return {
        currentSolutionOwner: videoEditorSelectors.data.solutions.selectCurrentSolutionOwner(state),
        annotations: videoEditorSelectors.data.selectCurrentAnnotationsByStartTime(state),
        previousSolutions: videoEditorSelectors.selectActiveSolutionsWithAnnotations(state),
        exercisePhaseType: configSelectors.selectPhaseType(state),
        isSolutionView: configSelectors.selectIsSolutionView(state),
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
                <AnnotationLane annotations={props.annotations} />
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
