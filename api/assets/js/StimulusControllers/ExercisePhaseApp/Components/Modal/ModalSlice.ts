import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '../../Store/Store'
import { ComponentTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ComponentTypesEnum'

interface ModalState {
    isVisible: boolean
    title: string
    content: string
    component?: ComponentTypesEnum
}

const initialState: ModalState = {
    isVisible: false,
    title: '',
    content: '',
    component: undefined,
}

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
        setComponent: (state, action: PayloadAction<ComponentTypesEnum>) => {
            state.component = action.payload
        },
    },
})

export const { toggleModalVisibility, setTitle, setContent, setComponent } = modalSlice.actions

export const selectIsVisible = (state: AppState) => state.modal.isVisible
export const selectTitle = (state: AppState) => state.modal.title
export const selectContent = (state: AppState) => state.modal.content
export const selectComponent = (state: AppState) => state.modal.component

export default modalSlice.reducer
