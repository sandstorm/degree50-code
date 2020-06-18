import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';
import {Video} from "./VideoPlayerWrapper";

interface VideoPlayerWrapperState {
    activeVideo: Video
    activeVideoIndex: number
}

const initialState: VideoPlayerWrapperState = {
    activeVideo: null,
    activeVideoIndex: 0
};

export const videoPlayerWrapperSlice = createSlice({
    name: 'videoPlayerWrapper',
    initialState,
    reducers: {
        setVideo: (state, action: PayloadAction<Video>) => {
            state.activeVideo = action.payload;
        },
        setVideoIndex: (state, action: PayloadAction<number>) => {
            state.activeVideoIndex = action.payload;
        },
    },
});

export const { setVideo, setVideoIndex } = videoPlayerWrapperSlice.actions;

export const selectActiveVideo = (state: RootState) => state.videoPlayerWrapper.activeVideo;
export const selectActiveVideoIndex = (state: RootState) => state.videoPlayerWrapper.activeVideoIndex;

export default videoPlayerWrapperSlice.reducer;
