import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../Store/Store';

interface ModalState {
    isVisible: boolean
    title: string
    content: string
    component: string
}

const initialState: ModalState = {
    isVisible: false,
    title: '',
    content: '',
    component: null,
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
        },
        setComponent: (state, action: PayloadAction<string>) => {
            state.component = action.payload
        },
    },
});

export const { toggleModalVisibility, setTitle, setContent, setComponent } = modalSlice.actions;

export const selectIsVisible = (state: RootState) => state.modal.isVisible;
export const selectTitle = (state: RootState) => state.modal.title;
export const selectContent = (state: RootState) => state.modal.content;
export const selectComponent = (state: RootState) => state.modal.component;

export default modalSlice.reducer;
