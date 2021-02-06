import PlayerSlice, { PlayerState, actions as playerActions, selectors as playerSelectors } from './PlayerSlice'
import { combineReducers, createSelector } from '@reduxjs/toolkit'

import MediaLaneRenderConfigSlice, {
    actions as mediaLaneRenderConfigActions,
    selectors as mediaLaneRenderConfigSelectors,
} from './MediaLaneRenderConfigSlice'
import { RenderConfig } from './components/MediaLane/MediaTrack'
import DataSlice, { actions as dataActions, selectors as dataSelectors } from './DataSlice'

import OverlaySlice, {
    actions as overlayActions,
    OverlayState,
    selectors as overlaySelectors,
} from './components/OverlayContainer/OverlaySlice'
import { DataState } from './DataSlice'
import { timeToSecond } from './utils'

export default combineReducers({
    data: DataSlice,
    player: PlayerSlice,
    mediaLaneRenderConfig: MediaLaneRenderConfigSlice,
    overlay: OverlaySlice,
})

export type VideoEditorState = {
    videoEditor: {
        data: DataState
        player: PlayerState
        mediaLaneRenderConfig: RenderConfig
        overlay: OverlayState
    }
}

export const actions = {
    data: dataActions,
    player: playerActions,
    mediaLaneRenderConfig: mediaLaneRenderConfigActions,
    overlay: overlayActions,
}

const selectActiveAnnotationIds = createSelector(
    [dataSelectors.annotations.selectCurrentAnnotationsByStartTime, playerSelectors.selectSyncPlayPosition],
    (annotations, currentPlayPosition) => {
        return annotations
            .filter(
                (annotation) =>
                    timeToSecond(annotation.start) <= currentPlayPosition &&
                    timeToSecond(annotation.end) >= currentPlayPosition
            )
            .map((annotation) => annotation.id)
    }
)

const selectActiveVideoCodeIds = createSelector(
    [dataSelectors.videoCodes.selectCurrentVideoCodesByStartTime, playerSelectors.selectSyncPlayPosition],
    (videoCodes, currentPlayPosition) => {
        return videoCodes
            .filter(
                (videoCode) =>
                    timeToSecond(videoCode.start) <= currentPlayPosition &&
                    timeToSecond(videoCode.end) >= currentPlayPosition
            )
            .map((videoCode) => videoCode.id)
    }
)

const selectActiveCutIds = createSelector(
    [dataSelectors.cuts.selectCurrentByStartTime, playerSelectors.selectSyncPlayPosition],
    (cuts, currentPlayPosition) => {
        return cuts
            .filter(
                (cut) => timeToSecond(cut.start) <= currentPlayPosition && timeToSecond(cut.end) >= currentPlayPosition
            )
            .map((cut) => cut.id)
    }
)

const selectSolution = createSelector(
    [
        dataSelectors.annotations.selectDenormalizedCurrent,
        dataSelectors.videoCodes.selectDenormalizedCurrent,
        dataSelectors.videoCodePrototypes.selectVideoCodePoolList,
        dataSelectors.cuts.selectDenormalizedCurrent,
    ],
    (annotations, videoCodes, videoCodePool, cuts) => ({
        annotations,
        videoCodes,
        customVideoCodesPool: videoCodePool,
        cutList: cuts,
    })
)

// FIXME
const selectAllSolutions = createSelector([selectSolution], (currentSolution) => {
    return [currentSolution]
})

export const selectors = {
    data: dataSelectors,
    player: playerSelectors,
    mediaLaneRenderConfig: mediaLaneRenderConfigSelectors,
    overlay: overlaySelectors,

    selectActiveAnnotationIds,
    selectActiveVideoCodeIds,
    selectActiveCutIds,
    selectSolution,
    selectAllSolutions,
}
