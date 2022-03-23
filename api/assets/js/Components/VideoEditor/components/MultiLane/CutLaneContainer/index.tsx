import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '..'
import { TabsTypesEnum } from 'types'
import VideoCutMedialane from 'Components/VideoEditor/components/MultiLane/CutLaneContainer/VideoCutMedialane'
import { VideoEditorState, selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { CurrentEditorStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { selectUserCanEditSolution } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import MediaLaneDescription from '../MediaLaneDescription'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice) => {
    const currentSolutionId = videoEditorSelectors.data.solutions.selectCurrentId(state)
    const isReadonly = !selectUserCanEditSolution(state, { solutionId: currentSolutionId })

    return {
        cuts: videoEditorSelectors.data.selectCurrentCutListByStartTime(state),
        currentSolutionOwner: videoEditorSelectors.data.solutions.selectCurrentSolutionOwner(state),
        currentIsFromGroupPhase: videoEditorSelectors.data.solutions.selectCurrentSolutionFromGroupPhase(state),
        isReadonly,
    }
}

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutLaneContainer = (props: Props) => {
    const ownerName = props.currentSolutionOwner.userName ?? '<Unbekannter Nutzer>'
    return (
        <>
            <div>
                <MediaLaneDescription
                    componentName={getComponentName(TabsTypesEnum.VIDEO_CUTTING)}
                    itemCount={props.cuts.length}
                    userName={ownerName}
                    isCurrent={true}
                    fromGroupPhase={props.currentIsFromGroupPhase}
                />
                <VideoCutMedialane cuts={props.cuts} readOnly={props.isReadonly} />
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CutLaneContainer))
