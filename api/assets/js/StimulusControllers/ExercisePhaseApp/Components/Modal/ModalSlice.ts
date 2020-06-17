import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';

interface ModalState {
    isVisible: boolean;
}

const initialState: ModalState = {
    isVisible: false,
};

export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        toggleVisibility: (state) => {
            console.log('toggle', state.isVisible);
            state.isVisible = !state.isVisible
        },
    },
});

export const { toggleVisibility } = modalSlice.actions;

export const selectIsVisible = (state: RootState) => state.modal.isVisible;

export default modalSlice.reducer;
