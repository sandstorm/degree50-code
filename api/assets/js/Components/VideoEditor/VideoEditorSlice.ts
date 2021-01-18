import PlayerSlice, { PlayerState, actions as playerActions, selectors as playerSelectors } from './PlayerSlice'
import VideoListsSlice, {
    VideoListsState,
    actions as videoListsActions,
    selectors as videoListsSelectors,
} from './VideoListsSlice'
import { combineReducers } from '@reduxjs/toolkit'
import ConfigSlice, {
    ConfigState,
    selectors as configSelectors,
    actions as configActions,
} from '../../StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

import MediaLaneRenderConfigSlice, {
    actions as mediaLaneRenderConfigActions,
    selectors as mediaLaneRenderConfigSelectors,
} from './MediaLaneRenderConfigSlice'
import { RenderConfig } from './Editors/components/MediaLane/MediaTrack'

import OverlaySlice, {
    actions as overlayActions,
    OverlayState,
    selectors as overlaySelectors,
} from './Toolbar/Overlay/OverlaySlice'

export default combineReducers({
    lists: VideoListsSlice,
    player: PlayerSlice,
    config: ConfigSlice,
    mediaLaneRenderConfig: MediaLaneRenderConfigSlice,
    overlay: OverlaySlice,
})

export type VideoEditorState = {
    videoEditor: {
        lists: VideoListsState
        player: PlayerState
        config: ConfigState
        mediaLaneRenderConfig: RenderConfig
        overlay: OverlayState
    }
}

export const actions = {
    lists: videoListsActions,
    player: playerActions,
    config: configActions,
    mediaLaneRenderConfig: mediaLaneRenderConfigActions,
    overlay: overlayActions,
}

export const selectors = {
    lists: videoListsSelectors,
    player: playerSelectors,
    config: configSelectors,
    mediaLaneRenderConfig: mediaLaneRenderConfigSelectors,
    overlay: overlaySelectors,
}
