import { combineReducers } from '@reduxjs/toolkit'
import {
    AnnotationsState,
    annotationsSlice,
    selectors as annotationSelectors,
} from '../../Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import {
    cuttingSlice,
    CutsState,
    selectors as cutsSelectors,
} from '../../Components/VideoEditor/CuttingContext/CuttingSlice'
import {
    videoCodePrototypesSlice,
    VideoCodePrototypesState,
    selectors as videoCodePrototypeSelectors,
} from '../../Components/VideoEditor/VideoCodesContext/VideoCodePrototypesSlice'
import {
    videoCodesSlice,
    VideoCodesState,
    selectors as videoCodeSelectors,
} from '../../Components/VideoEditor/VideoCodesContext/VideoCodesSlice'
import {
    SolutionSlice,
    selectors as solutionSelectors,
    SolutionState,
} from '../../Components/VideoEditor/SolutionSlice'
import { composedPrototypeSelectors } from '../../Components/VideoEditor/composedSelectors/prototypes'
import { composedCutSelectors } from '../../Components/VideoEditor/composedSelectors/cuts'
import { composedAnnotationSelectors } from '../../Components/VideoEditor/composedSelectors/annotations'
import { composedVideoCodeSelectors } from '../../Components/VideoEditor/composedSelectors/videoCodes'

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
