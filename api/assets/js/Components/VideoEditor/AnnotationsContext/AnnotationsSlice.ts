///////////
// STATE //
///////////

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { Annotation } from '../types'
import { initData } from '../initData'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

export type AnnotationId = string

export type AnnotationsState = {
    byId: Record<AnnotationId, Annotation>
}

export const initialState: AnnotationsState = {
    byId: {},
}

/////////////
// REDUCER //
/////////////

export const annotationsSlice = createSlice({
    name: 'annotations',
    initialState,
    reducers: {
        set: (state, action: PayloadAction<Annotation[]>) => {
            const normalized = action.payload.reduce((acc, annotation) => {
                return {
                    ...acc,
                    [annotation.id]: annotation,
                }
            }, {})

            return {
                ...state,
                byId: {
                    ...state.byId,
                    ...normalized,
                },
            }
        },
        append: (state: AnnotationsState, action: PayloadAction<Annotation>): AnnotationsState => {
            const newAnnotation = action.payload
            return {
                byId: {
                    ...state.byId,
                    [newAnnotation.id]: newAnnotation,
                },
            }
        },
        update: (
            state: AnnotationsState,
            action: PayloadAction<{ transientAnnotation: Annotation }>
        ): AnnotationsState => {
            const { transientAnnotation } = action.payload

            return {
                ...state,
                byId: set(state.byId, transientAnnotation.id, transientAnnotation),
            }
        },
        remove: (state: AnnotationsState, action: PayloadAction<string>): AnnotationsState => {
            const elementId = action.payload

            return {
                ...state,
                byId: remove(state.byId, elementId),
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(initData, (_, action) => {
            return action.payload.annotations
        })
    },
})

///////////////
// SELECTORS //
///////////////

const selectById = (state: AppState) => state.data.annotations.byId
const selectAnnotationById = (state: AppState, props: { annotationId: AnnotationId }) =>
    state.data.annotations.byId[props.annotationId]

export const selectors = {
    selectById,
    selectAnnotationById,
}
