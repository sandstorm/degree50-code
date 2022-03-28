import { createSelector } from '@reduxjs/toolkit'
import { VideoCodePrototype } from '../types'
import { selectors as solutionSelectors } from '../SolutionSlice'
import { selectors as videoCodePrototypeSelectors } from '../VideoCodesContext/VideoCodePrototypesSlice'

const prototypesByName = (a: VideoCodePrototype, b: VideoCodePrototype) => {
    if (a.name < b.name) {
        return -1
    } else if (a.name > b.name) {
        return 1
    } else {
        return 0
    }
}

const selectDenormalizedCurrentPrototypes = createSelector(
    [solutionSelectors.selectCurrentPrototypeIds, videoCodePrototypeSelectors.selectById],
    (currentIds, byId) => currentIds.map((id) => byId[id]).sort(prototypesByName)
)

const selectDenormalizedPrototypes = createSelector([videoCodePrototypeSelectors.selectById], (byId) =>
    Object.values(byId).map((prototype) => byId[prototype.id])
)

const selectAllPrototypesList = createSelector([selectDenormalizedPrototypes], (codes) => {
    return codes.reduce((prototypes: VideoCodePrototype[], code) => {
        if (code.parentId) {
            return prototypes
        }

        const childCodes = codes.filter((c) => c.parentId === code.id)

        return [...prototypes, { ...code, videoCodes: childCodes }]
    }, [])
})

const selectCurrentPrototypesList = createSelector([selectDenormalizedCurrentPrototypes], (codes) => {
    return codes.reduce((acc: VideoCodePrototype[], code) => {
        if (code.parentId) {
            return acc
        }

        const childCodes = codes.filter((c) => c.parentId === code.id)

        return [...acc, { ...code, videoCodes: childCodes }]
    }, [])
})

export const composedPrototypeSelectors = {
    selectCurrentPrototypesList,
    selectAllPrototypesList,
    selectDenormalizedCurrentPrototypes,
    selectDenormalizedPrototypes,
}
