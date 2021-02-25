import React from 'react'
import { connect } from 'react-redux'

import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import MediaLane from '../../MediaLane/index'
import { Cut, MediaItem } from '../../../types'
import { solveConflicts } from '../../../utils/solveItemConflicts'
import { MediaLaneRenderConfigState } from '../../../MediaLaneRenderConfigSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { useCuttingMediaItemHandling } from '../../../CuttingContext/util'

type OwnProps = {
    cuts: Cut[]
    readOnly?: boolean
}

const mapStateToProps = (state: VideoEditorState & MediaLaneRenderConfigState) => ({
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    syncSolution: syncSolutionAction,
    setCuts: actions.data.cuts.set,
    removeCut: actions.data.cuts.remove,
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

    const mediaItems: MediaItem<Cut>[] = solveConflicts(itemsFromCuts) as MediaItem<Cut>[]

    const { updateMediaItem } = useCuttingMediaItemHandling({
        mediaItems,
        setCutList: props.setCuts,
        updateCallback: props.syncSolution,
        updateCondition: true, // TODO
    })

    return (
        <MediaLane
            mediaItems={mediaItems}
            updateMediaItem={updateMediaItem}
            showTextInMediaItems={false}
            readOnly={props.readOnly}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CutMedialane))
