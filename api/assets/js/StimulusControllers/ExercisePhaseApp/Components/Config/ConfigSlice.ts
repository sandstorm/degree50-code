import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';
import {Video} from "../VideoPlayer/VideoPlayerWrapper";

export type ComponentId = string
export type Config = {
    title: string
    description: string
    type: string
    components: Array<ComponentId>
    material: Array<object>
    videos: Array<Video>
}

const initialState: Config = {
    title: '',
    description: '',
    type: '',
    components: [],
    material: [],
    videos: []
};

export const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setConfig: (state, action: PayloadAction<Config>) => {
            state.title = action.payload.title
            state.description = action.payload.description
            state.type = action.payload.type
            state.components = action.payload.components
            state.material = action.payload.material
            state.videos = action.payload.videos
        }
    },
});

export const { setConfig } = configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

export default configSlice.reducer;
