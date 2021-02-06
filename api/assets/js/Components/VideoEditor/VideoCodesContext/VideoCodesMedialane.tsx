import React, { useCallback } from 'react'
import { connect } from 'react-redux'

import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import MediaLane from '../components/MediaLane/index'
import { VideoCode, MediaItem } from '../types'
import { solveConflicts } from '../utils/solveItemConflicts'
import { useMediaItemHandling } from '../utils/useMediaItemHandling'
import { MediaLaneRenderConfigState } from '../MediaLaneRenderConfigSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { VideoCodePoolStateSlice } from './VideoCodePrototypesSlice'

type OwnProps = {
    videoDuration: number
    $mediaTrackRef: React.RefObject<HTMLDivElement> | React.RefCallback<HTMLDivElement> | null
    containerHeight: number
    containerWidth: number
    onClickLane: (time: number) => void
}

const mapStateToProps = (state: VideoEditorState & MediaLaneRenderConfigState & VideoCodePoolStateSlice) => {
    const videoCodes = selectors.data.videoCodes.selectVideoCodesByStartTime(state)
    const prototypes = selectors.data.videoCodePrototypes.selectById(state)

    const items = videoCodes.map(
        (videoCode) =>
            new MediaItem({
                start: videoCode.start,
                end: videoCode.end,
                text: videoCode.idFromPrototype ? prototypes[videoCode.idFromPrototype].name : '',
                memo: videoCode.memo,
                originalData: videoCode,
                lane: 0,
                color: videoCode.idFromPrototype ? prototypes[videoCode.idFromPrototype].color : null,
            })
    )

    return {
        mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
        items,
    }
}

const mapDispatchToProps = {
    syncSolution: syncSolutionAction,
    setVideoCodes: actions.data.videoCodes.set,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeMedialane = (props: Props) => {
    // FIXME typing
    const mediaItems: MediaItem<VideoCode>[] = solveConflicts(props.items) as MediaItem<VideoCode>[]

    const { removeMediaItem, updateMediaItem } = useMediaItemHandling<VideoCode>({
        currentTime: props.mediaLaneRenderConfig.currentTime,
        mediaItems,
        setMediaItems: props.setVideoCodes,
        timelineDuration: props.mediaLaneRenderConfig.duration,
        updateCallback: props.syncSolution,
        updateCondition: true, // TODO
    })

    const checkMediaItem = useCallback(() => {
        // false means no conflict => item is legal
        // true means conflict => item is illegal
        //
        // WHY: this hard coded check?
        // We currently do not yet have defined conditions under which videoCodes
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
            $mediaTrackRef={props.$mediaTrackRef}
            containerHeight={props.containerHeight}
            containerWidth={props.containerWidth}
            onClickLane={props.onClickLane}
            mediaItems={mediaItems}
            updateMediaItem={updateMediaItem}
            removeMediaItem={removeMediaItem}
            checkMediaItem={checkMediaItem}
            amountOfLanes={amountOfLanes}
            showTextInMediaItems={false}
        />
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoCodeMedialane))
