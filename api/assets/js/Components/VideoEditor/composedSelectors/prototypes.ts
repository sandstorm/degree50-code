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
  [
    solutionSelectors.selectCurrentPrototypeIds,
    videoCodePrototypeSelectors.selectById,
  ],
  (currentIds, byId) => currentIds.map((id) => byId[id]).sort(prototypesByName)
)

const selectDenormalizedPrototypes = createSelector(
  [videoCodePrototypeSelectors.selectById],
  (byId) =>
    Object.values(byId)
      .map((prototype) => byId[prototype.id])
      .sort(prototypesByName)
)

const selectAllPrototypesList = createSelector(
  [selectDenormalizedPrototypes],
  (prototypes) => {
    return prototypes.reduce(
      (allPrototypes: VideoCodePrototype[], prototype) => {
        if (prototype.parentId) {
          return allPrototypes
        }

        const childCodes = prototypes.filter((p) => p.parentId === prototype.id)

        return [...allPrototypes, { ...prototype, videoCodes: childCodes }]
      },
      []
    )
  }
)

const selectAllPrototypesFlattened = createSelector(
  [selectAllPrototypesList],
  (prototypes) => {
    return prototypes.reduce(
      (allFlattenedPrototypes: VideoCodePrototype[], prototype) => {
        return [...allFlattenedPrototypes, prototype, ...prototype.videoCodes]
      },
      []
    )
  }
)

const selectCurrentPrototypesList = createSelector(
  [selectDenormalizedCurrentPrototypes],
  (prototypes) => {
    return prototypes.reduce((acc: VideoCodePrototype[], prototype) => {
      if (prototype.parentId) {
        return acc
      }

      const childCodes = prototypes.filter((c) => c.parentId === prototype.id)

      return [...acc, { ...prototype, videoCodes: childCodes }]
    }, [])
  }
)

export const composedPrototypeSelectors = {
  selectCurrentPrototypesList,
  selectAllPrototypesList,
  selectAllPrototypesFlattened,
  selectDenormalizedCurrentPrototypes,
}
