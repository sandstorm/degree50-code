import { AnnotationFromAPI, VideoCodeFromAPI, CutFromAPI, VideoCodePrototype } from 'Components/VideoEditor/types'
import { generate } from 'shortid'
import { ConfigState } from './ExercisePhaseApp/Components/Config/ConfigSlice'

/**
 * Normalizes a list of entities into an object with a 'byId'-lookup property of the entities,
 * and an 'ids' property with all string ids of the entities.
 *
 * If an entity does not have an id we generate a new unique id with shortid.
 */
export const normalizeData = <E extends { id: string }>(entities: Array<E>) =>
    entities.reduce(
        (acc: { byId: { [id: string]: E }; ids: string[] }, entity: E) => {
            return {
                byId: {
                    ...acc.byId,
                    [entity.id]: {
                        ...entity,
                    },
                },
                ids: [...acc.ids, entity.id],
            }
        },
        { byId: {}, ids: [] }
    )

const addIdsToEntities = <E extends { id?: string }>(entities: Array<E>) =>
    entities.map((e) => ({ ...e, id: e?.id ?? generate() }))

export const prepareAnnotationsFromSolution = (solution: any) => {
    const annotations: AnnotationFromAPI[] = solution?.annotations ?? []
    return normalizeData(addIdsToEntities(annotations))
}

export const prepareVideoCodesFromSolution = (solution: any) => {
    const videoCodes: VideoCodeFromAPI[] = solution?.videoCodes ?? []
    return normalizeData(addIdsToEntities(videoCodes))
}

export const prepareCutsFromSolution = (solution: any) => {
    const cuts: CutFromAPI[] = solution?.cutList ?? []
    return normalizeData(addIdsToEntities(cuts))
}

export const prepareVideoCodePoolFromSolution = (solution: any, config?: ConfigState) => {
    const customVideoCodePool: VideoCodePrototype[] = (() => {
        if (solution.customVideoCodesPool && solution.customVideoCodesPool.length > 0) {
            return solution.customVideoCodesPool
        } else if (config?.videoCodesPool) {
            return config.videoCodesPool
        } else {
            return []
        }
    })()

    const flattenedVideoCodePool: VideoCodePrototype[] = customVideoCodePool.reduce(
        (acc: VideoCodePrototype[], code) => {
            const children = code.videoCodes
            const childrenWithParentId = children.map((c) => ({
                ...c,
                parentId: c.parentId ?? code.id,
            }))

            return [...acc, code, ...childrenWithParentId]
        },
        []
    )
    return normalizeData(addIdsToEntities(flattenedVideoCodePool))
}
