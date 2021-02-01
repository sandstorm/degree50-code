import PlayerSlice, { PlayerState, actions as playerActions, selectors as playerSelectors } from './PlayerSlice'
import VideoListsSlice, {
    VideoListsState,
    actions as videoListsActions,
    selectors as videoListsSelectors,
} from './VideoListsSlice'
import { combineReducers, createSelector } from '@reduxjs/toolkit'
import ConfigSlice, {
    ConfigState,
    selectors as configSelectors,
    actions as configActions,
} from '../../StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

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
    lists: VideoListsSlice,
    data: DataSlice,
    player: PlayerSlice,
    config: ConfigSlice,
    mediaLaneRenderConfig: MediaLaneRenderConfigSlice,
    overlay: OverlaySlice,
})

export type VideoEditorState = {
    videoEditor: {
        lists: VideoListsState
        data: DataState
        player: PlayerState
        config: ConfigState
        mediaLaneRenderConfig: RenderConfig
        overlay: OverlayState
    }
}

export const actions = {
    lists: videoListsActions,
    data: dataActions,
    player: playerActions,
    config: configActions,
    mediaLaneRenderConfig: mediaLaneRenderConfigActions,
    overlay: overlayActions,
}

const selectActiveAnnotationIds = createSelector(
    [dataSelectors.annotations.selectAnnotationsByStartTime, playerSelectors.selectSyncPlayPosition],
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
    [dataSelectors.videoCodes.selectVideoCodesByStartTime, playerSelectors.selectSyncPlayPosition],
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
    [dataSelectors.cuts.selectCutsByStartTime, playerSelectors.selectSyncPlayPosition],
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
        videoListsSelectors.selectVideoEditorLists,
        dataSelectors.annotations.selectDenormalizedAnnotations,
        dataSelectors.videoCodes.selectDenormalizedVideoCodes,
        dataSelectors.videoCodePool.selectVideoCodePoolList,
        dataSelectors.cuts.selectDenormalizedCuts,
    ],
    // TODO continue refactoring for subtitles
    // NOTE: we are currently in the middle of refactoring lists into separate slices, which is why we merge our
    // "old" solution state with those, that have already been refactored
    (otherVideoLists, annotations, videoCodes, videoCodePool, cuts): VideoListsState => ({
        ...otherVideoLists,
        annotations,
        videoCodes,
        customVideoCodesPool: videoCodePool,
        cutList: cuts,
    })
)

export const selectors = {
    lists: videoListsSelectors,
    data: dataSelectors,
    player: playerSelectors,
    config: configSelectors,
    mediaLaneRenderConfig: mediaLaneRenderConfigSelectors,
    overlay: overlaySelectors,

    selectActiveAnnotationIds,
    selectActiveVideoCodeIds,
    selectActiveCutIds,
    selectSolution,
}
