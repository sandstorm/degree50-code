///////////
// STATE //
///////////

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove, set } from 'immutable'
import { annotationSchema } from 'StimulusControllers/normalizeData'
import { Annotation } from '../types'
import { normalize } from 'normalizr'

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
        init: (state, action: PayloadAction<AnnotationsState>) => {
            return {
                ...state,
                ...action.payload,
            }
        },
        set: (state, action: PayloadAction<Annotation[]>) => {
            const normalized = normalize(action.payload, [annotationSchema])

            return {
                ...state,
                byId: {
                    ...state.byId,
                    ...normalized.entities.annotations,
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
})

///////////////
// SELECTORS //
///////////////

type AnnotationsSlice = { videoEditor: { data: { annotations: AnnotationsState } } }

const selectById = (state: AnnotationsSlice) => state.videoEditor.data.annotations.byId
const selectAnnotationById = (state: AnnotationsSlice, props: { annotationId: AnnotationId }) =>
    state.videoEditor.data.annotations.byId[props.annotationId]

export const selectors = {
    selectById,
    selectAnnotationById,
}
