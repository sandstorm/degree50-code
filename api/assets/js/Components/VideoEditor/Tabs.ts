import { TabsTypesEnum } from 'types'

export type Tab = {
    id: TabsTypesEnum
    label: string
}

export type Tabs = {
    [key in TabsTypesEnum]: Tab
}

export const videoEditorPlayerTabs = {
    [TabsTypesEnum.ORIGINAL_VIDEO]: {
        id: TabsTypesEnum.ORIGINAL_VIDEO,
        label: 'Original',
    },
    [TabsTypesEnum.CUT_VIDEO]: {
        id: TabsTypesEnum.CUT_VIDEO,
        label: 'Cut',
    },
}

export const tabs = {
    [TabsTypesEnum.VIDEO_ANNOTATIONS]: {
        id: TabsTypesEnum.VIDEO_ANNOTATIONS,
        label: 'Annotations',
    },
    [TabsTypesEnum.VIDEO_CODES]: {
        id: TabsTypesEnum.VIDEO_CODES,
        label: 'Video Codes',
    },
    [TabsTypesEnum.VIDEO_CUTTING]: {
        id: TabsTypesEnum.VIDEO_CUTTING,
        label: 'Video Cuts',
    },
    [TabsTypesEnum.VIDEO_SUBTITLES]: {
        id: TabsTypesEnum.VIDEO_SUBTITLES,
        label: 'Video Subtitles',
    },
}

export const solutionTabs = {
    [TabsTypesEnum.SOLUTIONS]: {
        id: TabsTypesEnum.SOLUTIONS,
        label: 'Ergebnisse',
    },
    [TabsTypesEnum.SOLUTION_FILTERS]: {
        id: TabsTypesEnum.SOLUTION_FILTERS,
        label: 'Filter',
    },
}
