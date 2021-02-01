import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RenderConfig } from './components/MediaLane/MediaTrack'
import { INITIAL_ZOOM } from './components/MediaLane/useMediaLane'

export const initialRenderConfig: RenderConfig = {
    padding: 0,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
    drawRuler: true,
    zoom: INITIAL_ZOOM,
}

const MediaLaneRenderConfigSlice = createSlice({
    name: 'MediaLaneRenderConfig',
    initialState: initialRenderConfig,
    reducers: {
        setRenderConfig: (_: RenderConfig, action: PayloadAction<RenderConfig>): RenderConfig => action.payload,
    },
})

export const { actions } = MediaLaneRenderConfigSlice

export default MediaLaneRenderConfigSlice.reducer

export type MediaLaneRenderConfigState = { mediaLaneRenderConfig: RenderConfig }

const selectRenderConfig = (state: MediaLaneRenderConfigState) => state.mediaLaneRenderConfig

export const selectors = {
    selectRenderConfig,
}
