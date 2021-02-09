import React from 'react'
import { connect } from 'react-redux'

import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { MediaLaneRenderConfigState } from 'Components/VideoEditor/MediaLaneRenderConfigSlice'
import { MediaItem, Annotation } from 'Components/VideoEditor/types'
import { solveConflicts } from 'Components/VideoEditor/utils/solveItemConflicts'
import { useMediaItemHandling } from 'Components/VideoEditor/utils/useMediaItemHandling'
import MediaLane from '../../MediaLane'

type OwnProps = {
    annotations: Annotation[]
    readOnly?: boolean
}

const mapStateToProps = (state: VideoEditorState & MediaLaneRenderConfigState) => ({
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    syncSolution: syncSolutionAction,
    setAnnotations: actions.data.annotations.set,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const Annotationlane = (props: Props) => {
    const itemsFromAnnotations = props.annotations.map(
        (entity) =>
            new MediaItem({
                start: entity.start,
                end: entity.end,
                text: entity.text,
                memo: entity.memo,
                originalData: entity,
                lane: 0,
            })
    )

    const mediaItems = solveConflicts(itemsFromAnnotations) as MediaItem<Annotation>[]

    const { updateMediaItem } = useMediaItemHandling<Annotation>({
        mediaItems,
        setMediaItems: props.setAnnotations,
        updateCallback: props.syncSolution,
        updateCondition: true, // TODO
    })

    return (
        <MediaLane
            updateMediaItem={updateMediaItem}
            mediaItems={mediaItems}
            showTextInMediaItems={false}
            readOnly={props.readOnly}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Annotationlane))
