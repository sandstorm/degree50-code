import { MediaItemType } from 'Components/VideoEditor/VideoEditorSlice'

export type Cut = MediaItemType & {
    url: string
    offset: number
    playbackRate: number
}

export type CutList = Array<Cut>
