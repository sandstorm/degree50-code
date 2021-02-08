import React, { useCallback } from 'react'
import { connect } from 'react-redux'

import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import MediaLane from '../components/MediaLane/index'
import { Annotation, MediaItem } from '../types'
import { solveConflicts } from '../utils/solveItemConflicts'
import { useMediaItemHandling } from '../utils/useMediaItemHandling'
import { MediaLaneRenderConfigState } from '../MediaLaneRenderConfigSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'

const mapStateToProps = (state: VideoEditorState & MediaLaneRenderConfigState) => ({
    annotations: selectors.data.selectCurrentAnnotationsByStartTime(state),
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    syncSolution: syncSolutionAction,
    setAnnotations: actions.data.annotations.set,
    removeAnnotation: actions.data.annotations.remove,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationMedialane = (props: Props) => {
    const itemsFromAnnotations = props.annotations.map(
        (sub) =>
            new MediaItem({
                start: sub.start,
                end: sub.end,
                text: sub.text,
                memo: sub.memo,
                originalData: sub,
                lane: 0,
            })
    )

    // FIXME typing
    const mediaItems: MediaItem<Annotation>[] = solveConflicts(itemsFromAnnotations) as MediaItem<Annotation>[]

    const { updateMediaItem } = useMediaItemHandling<Annotation>({
        currentTime: props.mediaLaneRenderConfig.currentTime,
        mediaItems,
        setMediaItems: props.setAnnotations,
        timelineDuration: props.mediaLaneRenderConfig.duration,
        updateCallback: props.syncSolution,
        updateCondition: true, // TODO
    })

    const checkMediaItem = useCallback(() => {
        // false means no conflict => item is legal
        // true means conflict => item is illegal
        //
        // WHY: this hard coded check?
        // We currently do not yet have defined conditions under which annotations
        // are considered to be illegal.
        // Because they may also overlap etc., we do not use the checkMediaItem() function
        // provided by useMediaItemHandling().
        return false
    }, [])

    const amountOfLanes = Math.max(
        0,
        ...mediaItems.map((item: MediaItem<any>) => {
            return item.lane
        })
    )

    return (
        <MediaLane
            mediaItems={mediaItems}
            updateMediaItem={updateMediaItem}
            removeMediaItem={props.removeAnnotation}
            checkMediaItem={checkMediaItem}
            amountOfLanes={amountOfLanes}
            showTextInMediaItems={false}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AnnotationMedialane))
