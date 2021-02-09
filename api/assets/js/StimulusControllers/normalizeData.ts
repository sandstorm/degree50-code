import { schema, normalize, NormalizedSchema } from 'normalizr'
import { VideoCodePrototype, Annotation, Cut, SolutionId, Solution, VideoCode } from 'Components/VideoEditor/types'
import { generate } from 'shortid'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { VideoCodeId } from 'Components/VideoEditor/VideoCodesContext/VideoCodesSlice'
import { CutId } from 'Components/VideoEditor/CuttingContext/CuttingSlice'
import { VideoCodePrototypeId } from 'Components/VideoEditor/VideoCodesContext/VideoCodePrototypesSlice'
import { ConfigState } from './ExercisePhaseApp/Components/Config/ConfigSlice'

export const addIdsToEntities = <E extends { id?: string }>(entities: Array<E>) =>
    entities.map((e) => ({ ...e, id: e?.id ?? generate() }))

export const ANNOTATIONS_API_PROPERTY = 'annotations'
export const VIDEO_CODES_API_PROPERTY = 'videoCodes'
export const CUTLIST_API_PROPERTY = 'cutList'
export const VIDEO_CODE_PROTOTYPE_API_PROPERTY = 'customVideoCodesPool'

const addMissingIdProcessStrategy = (value: any) => {
    if (!value.id) {
        return { ...value, id: generate() }
    }
    return { ...value }
}

export const annotationSchema = new schema.Entity(
    ANNOTATIONS_API_PROPERTY,
    {},
    { processStrategy: addMissingIdProcessStrategy }
)
export const videoCodesSchema = new schema.Entity(
    VIDEO_CODES_API_PROPERTY,
    {},
    { processStrategy: addMissingIdProcessStrategy }
)
export const cutListSchema = new schema.Entity(
    CUTLIST_API_PROPERTY,
    {},
    { processStrategy: addMissingIdProcessStrategy }
)

const videoCodePrototypeChildren = new schema.Entity(VIDEO_CODE_PROTOTYPE_API_PROPERTY, {
    processStrategy: addMissingIdProcessStrategy,
})
export const videoCodePrototypeSchema = new schema.Entity(VIDEO_CODE_PROTOTYPE_API_PROPERTY, {
    videoCodes: [videoCodePrototypeChildren],
})

const solutionSchema = new schema.Entity('solutions', {
    solution: {
        annotations: [annotationSchema],
        videoCodes: [videoCodesSchema],
        cutList: [cutListSchema],
        customVideoCodesPool: [videoCodePrototypeSchema],
    },
})

export const preparedAPIResponseSchema = {
    currentSolution: solutionSchema,
    previousSolutions: [solutionSchema],
}

type NormalizedEntities = {
    annotations: Record<AnnotationId, Annotation>
    videoCodes: Record<VideoCodeId, VideoCode>
    cutList: Record<CutId, Cut>
    solutions: Record<SolutionId, Solution>
    customVideoCodesPool: Record<VideoCodePrototypeId, VideoCodePrototype>
}

type NormalizedResult = {
    currentSolution: SolutionId | undefined
    previousSolutions: SolutionId[]
}

// TODO add solution typing
export const normalizeAPIResponse = (
    solution: any,
    config: ConfigState
): NormalizedSchema<NormalizedEntities, NormalizedResult> => {
    const videoCodePrototypesFromConfig = config.videoCodesPool

    const customVideoCodesPool: VideoCodePrototype[] =
        solution.solution.customVideoCodesPool ?? videoCodePrototypesFromConfig

    // Flatten so that children are also listed
    const flattenedVideoCodePool: VideoCodePrototype[] = customVideoCodesPool.reduce(
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

    const preparedData = {
        previousSolutions: config.previousSolutions,
        currentSolution: {
            ...solution,
            solution: {
                ...solution.solution,
                customVideoCodesPool: flattenedVideoCodePool,
            },
        },
    }

    return normalize(preparedData, preparedAPIResponseSchema)
}
