import { combineReducers } from '@reduxjs/toolkit'
import {
    AnnotationsState,
    annotationsSlice,
    selectors as annotationSelectors,
} from './AnnotationsContext/AnnotationsSlice'
import { cuttingSlice, CutsState, selectors as cutsSelectors } from './CuttingContext/CuttingSlice'
import {
    videoCodePrototypesSlice,
    VideoCodePrototypesState,
    selectors as videoCodePrototypeSelectors,
} from './VideoCodesContext/VideoCodePrototypesSlice'
import { videoCodesSlice, VideoCodesState, selectors as videoCodeSelectors } from './VideoCodesContext/VideoCodesSlice'
import { SolutionSlice, selectors as solutionSelectors, SolutionState } from './SolutionSlice'
import { composedPrototypeSelectors } from './composedSelectors/prototypes'
import { composedCutSelectors } from './composedSelectors/cuts'
import { composedAnnotationSelectors } from './composedSelectors/annotations'
import { composedVideoCodeSelectors } from './composedSelectors/videoCodes'

export type DataState = {
    solutions: SolutionState
    annotations: AnnotationsState
    videoCodes: VideoCodesState
    videoCodePrototypes: VideoCodePrototypesState
    cuts: CutsState
}

export default combineReducers({
    solutions: SolutionSlice.reducer,
    annotations: annotationsSlice.reducer,
    videoCodes: videoCodesSlice.reducer,
    videoCodePrototypes: videoCodePrototypesSlice.reducer,
    cuts: cuttingSlice.reducer,
})

export const actions = {
    solutions: SolutionSlice.actions,
    annotations: annotationsSlice.actions,
    videoCodes: videoCodesSlice.actions,
    videoCodePrototypes: videoCodePrototypesSlice.actions,
    cuts: cuttingSlice.actions,
}

export const selectors = {
    solutions: solutionSelectors,
    annotations: annotationSelectors,
    videoCodes: videoCodeSelectors,
    videoCodePrototypes: videoCodePrototypeSelectors,
    cuts: cutsSelectors,

    ...composedVideoCodeSelectors,
    ...composedAnnotationSelectors,
    ...composedCutSelectors,
    ...composedPrototypeSelectors,
}
