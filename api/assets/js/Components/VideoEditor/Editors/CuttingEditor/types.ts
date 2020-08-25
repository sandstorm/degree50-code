import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'

export type Cut = MediaItemType & {
    url: string
    offset: number
    playbackRate: number
}

export type CutList = Array<Cut>
