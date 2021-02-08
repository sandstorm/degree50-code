import React, { useCallback } from 'react'
import { connect } from 'react-redux'

import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import MediaLane from '../components/MediaLane/index'
import { Cut, MediaItem } from '../types'
import { solveConflicts } from '../utils/solveItemConflicts'
import { MediaLaneRenderConfigState } from '../MediaLaneRenderConfigSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { useCuttingMediaItemHandling } from './util'

type OwnProps = {
    videoDuration: number
    $mediaTrackRef: React.RefObject<HTMLDivElement> | React.RefCallback<HTMLDivElement> | null
    containerHeight: number
    containerWidth: number
    onClickLane: (time: number) => void
}

const mapStateToProps = (state: VideoEditorState & MediaLaneRenderConfigState) => ({
    cuts: selectors.data.cuts.selectCurrentByStartTime(state),
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    syncSolution: syncSolutionAction,
    setCuts: actions.data.cuts.set,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const CutMedialane = (props: Props) => {
    const itemsFromCuts = props.cuts.map(
        (cut) =>
            new MediaItem({
                start: cut.start,
                end: cut.end,
                text: cut.text,
                memo: cut.memo,
                originalData: cut,
                lane: 0,
            })
    )

    // FIXME typing
    const mediaItems: MediaItem<Cut>[] = solveConflicts(itemsFromCuts) as MediaItem<Cut>[]

    const { removeMediaItem, updateMediaItem } = useCuttingMediaItemHandling({
        currentTime: props.mediaLaneRenderConfig.currentTime,
        mediaItems,
        setCutList: props.setCuts,
        timelineDuration: props.mediaLaneRenderConfig.duration,
        updateCallback: props.syncSolution,
        updateCondition: true, // TODO
    })

    const checkMediaItem = useCallback(() => {
        // false means no conflict => item is legal
        // true means conflict => item is illegal
        //
        // WHY: this hard coded check?
        // We currently do not yet have defined conditions under which cuts
        // are considered to be illegal.
        // Because they may also overlap etc., we do not use the checkMediaItem() function
        // provided by useMediaItemHandling().
        return false
    }, [])

    return (
        <MediaLane
            $mediaTrackRef={props.$mediaTrackRef}
            containerHeight={props.containerHeight}
            containerWidth={props.containerWidth}
            onClickLane={props.onClickLane}
            mediaItems={mediaItems}
            updateMediaItem={updateMediaItem}
            removeMediaItem={removeMediaItem}
            checkMediaItem={checkMediaItem}
            amountOfLanes={0}
            showTextInMediaItems={false}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CutMedialane))
