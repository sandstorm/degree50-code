import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';

interface ModalState {
    isVisible: boolean
    title: string
    content: string
}

const initialState: ModalState = {
    isVisible: false,
    title: '',
    content: '',
};

export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        toggleModalVisibility: (state) => {
            state.isVisible = !state.isVisible
        },
        setTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload
        },
        setContent: (state, action: PayloadAction<string>) => {
            state.content = action.payload
        }
    },
});

export const { toggleModalVisibility, setTitle, setContent } = modalSlice.actions;

export const selectIsVisible = (state: RootState) => state.modal.isVisible;
export const selectTitle = (state: RootState) => state.modal.title;
export const selectContent = (state: RootState) => state.modal.content;

export default modalSlice.reducer;
