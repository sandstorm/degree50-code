import PlayerSlice, { PlayerState, actions as playerActions, selectors as playerSelectors } from './PlayerSlice'
import VideoListsSlice, {
    VideoListsState,
    actions as videoListsActions,
    selectors as videoListsSelectors,
} from './VideoListsSlice'
import { combineReducers } from '@reduxjs/toolkit'

export default combineReducers({
    lists: VideoListsSlice,
    player: PlayerSlice,
})

export type VideoEditorState = {
    videoEditor: {
        lists: VideoListsState
        player: PlayerState
    }
}

export const actions = {
    lists: videoListsActions,
    player: playerActions,
}

export const selectors = {
    lists: videoListsSelectors,
    player: playerSelectors,
}
