import { combineReducers } from '@reduxjs/toolkit'
import { AnnotationsState, AnnotationsSlice, selectors as annotationSelectors } from './AnnotationsSlice'

export type DataState = {
    annotations: AnnotationsState
}

export default combineReducers({
    annotations: AnnotationsSlice.reducer,
})

export const actions = {
    annotations: AnnotationsSlice.actions,
}

export const selectors = {
    annotations: annotationSelectors,
}
