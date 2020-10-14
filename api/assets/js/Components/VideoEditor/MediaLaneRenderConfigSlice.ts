import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RenderConfig } from './Editors/components/MediaLane/MediaTrack'

export const initialRenderConfig: RenderConfig = {
    padding: 0,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
    drawRuler: true,
}

const MediaLaneRenderConfigSlice = createSlice({
    name: 'MediaLaneRenderConfig',
    initialState: initialRenderConfig,
    reducers: {
        setRenderConfig: (state: RenderConfig, action: PayloadAction<RenderConfig>): RenderConfig => action.payload,
    },
})

export const { actions } = MediaLaneRenderConfigSlice

export default MediaLaneRenderConfigSlice.reducer

const selectRenderConfig = (state: { mediaLaneRenderConfig: RenderConfig }) => state.mediaLaneRenderConfig

export const selectors = {
    selectRenderConfig,
}
