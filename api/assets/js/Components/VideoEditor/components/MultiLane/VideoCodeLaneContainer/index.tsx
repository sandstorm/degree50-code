import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '../index'
import { TabsTypesEnum } from 'types'
import VideoCodesMedialane from 'Components/VideoEditor/components/MultiLane/VideoCodeLaneContainer/VideoCodesMedialane'
import { VideoEditorState, selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import { MediaItem, VideoCode, VideoCodePrototype } from 'Components/VideoEditor/types'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { CurrentEditorStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { selectUserCanEditSolution } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExerciseAndSolutionStore/ExercisePhaseTypesEnum'
import MediaLaneDescription from '../MediaLaneDescription'

const mergeCodesAndPrototypesToItems = (videoCodes: VideoCode[], prototypes: Record<string, VideoCodePrototype>) => {
    return videoCodes.map((videoCode) => {
        const prototype = prototypes[videoCode.idFromPrototype]

        return new MediaItem({
            start: videoCode.start,
            end: videoCode.end,
            text: prototype ? prototype.name : '',
            memo: videoCode.memo,
            originalData: videoCode,
            lane: 0,
            color: prototype ? prototype.color : null,
        })
    })
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice) => {
    const currentSolutionId = videoEditorSelectors.data.solutions.selectCurrentId(state)
    const isReadonly = !selectUserCanEditSolution(state, { solutionId: currentSolutionId })

    return {
        currentSolutionOwner: videoEditorSelectors.data.solutions.selectCurrentSolutionOwner(state),
        currentIsFromGroupPhase: videoEditorSelectors.data.solutions.selectCurrentSolutionFromGroupPhase(state),
        videoCodesById: videoEditorSelectors.data.videoCodes.selectById(state),
        videoCodes: videoEditorSelectors.data.selectCurrentVideoCodesByStartTime(state),
        prototypes: videoEditorSelectors.data.videoCodePrototypes.selectById(state),
        previousSolutions: videoEditorSelectors.selectActiveSolutionsWithVideoCodes(state),
        exercisePhaseType: configSelectors.selectPhaseType(state),
        isSolutionView: configSelectors.selectIsSolutionView(state),
        isReadonly,
    }
}

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const VideoCodeLaneContainer = (props: Props) => {
    const componentName = getComponentName(TabsTypesEnum.VIDEO_CODES)

    if (!props.isSolutionView && props.exercisePhaseType === ExercisePhaseTypesEnum.VIDEO_ANALYSIS) {
        const mediaItems = mergeCodesAndPrototypesToItems(props.videoCodes, props.prototypes)
        const ownerName = props.currentSolutionOwner.userName ?? '<Unbekannter Nutzer>'

        return (
            <div>
                <MediaLaneDescription
                    componentName={getComponentName(TabsTypesEnum.VIDEO_CODES)}
                    itemCount={mediaItems.length}
                    userName={ownerName}
                    isCurrent={true}
                    fromGroupPhase={props.currentIsFromGroupPhase}
                />
                <VideoCodesMedialane mediaItems={mediaItems} readOnly={props.isReadonly} />
            </div>
        )
    }

    return (
        <>
            {props.previousSolutions.map((solution) => {
                const videoCodes = solution.solutionLists.videoCodes.map((id) => props.videoCodesById[id])
                const mediaItems = mergeCodesAndPrototypesToItems(videoCodes, props.prototypes)

                return (
                    <div key={solution.id}>
                        <div className="multilane__medialane-description">
                            {componentName} ({mediaItems.length}) - {solution.userName}
                        </div>
                        <MediaLaneDescription
                            componentName={componentName}
                            itemCount={mediaItems.length}
                            userName={solution.userName}
                            fromGroupPhase={solution.fromGroupPhase}
                        />
                        <VideoCodesMedialane mediaItems={mediaItems} readOnly />
                    </div>
                )
            })}
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoCodeLaneContainer))
