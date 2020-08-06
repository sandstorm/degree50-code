import { TabsTypesEnum } from '../../Store/ComponentTypesEnum'

export type Tab = {
    id: TabsTypesEnum
    label: string
}

export type Tabs = {
    [key in TabsTypesEnum]: Tab
}

export const tabs: Tabs = {
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
}
