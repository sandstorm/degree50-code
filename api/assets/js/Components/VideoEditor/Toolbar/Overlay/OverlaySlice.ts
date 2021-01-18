import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OverlayState = {
    isVisible: boolean
    currentOverlayId?: string
}

const initialState: OverlayState = {
    isVisible: false,
    currentOverlayId: undefined,
}

const OverlaySlice = createSlice({
    name: 'Overlay',
    initialState,
    reducers: {
        show: (state: OverlayState) => ({
            ...state,
            isVisible: true,
        }),
        hide: (state: OverlayState) => ({
            ...state,
            isVisible: false,
        }),
        setOverlay: (state: OverlayState, action: PayloadAction<string>) => ({
            ...state,
            currentOverlayId: action.payload,
            isVisible: true,
        }),
        unsetOverlay: (state: OverlayState) => ({
            ...state,
            currentOverlayId: undefined,
            isVisible: false,
        }),
    },
})

export const { actions } = OverlaySlice

const isVisibleSelector = (state: { videoEditor: { overlay: OverlayState } }) => state.videoEditor.overlay.isVisible
const overlayIdSelector = (state: { videoEditor: { overlay: OverlayState } }) =>
    state.videoEditor.overlay.currentOverlayId

export const selectors = {
    isVisible: isVisibleSelector,
    overlayId: overlayIdSelector,
}

export default OverlaySlice.reducer
