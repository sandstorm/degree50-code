import React from 'react'
import { MediaItem } from '../../types'
import { MediaItemType } from 'Components/VideoEditor/VideoListsSlice'

type Props = {
    item: MediaItem<MediaItemType>
    showTextInMediaItems: boolean
}

const MediaItemLabel = ({ item, showTextInMediaItems }: Props) => {
    // Used for video-codes
    const getShortCodeForItemLabel = (title: string) => {
        const splitStr = title.toLowerCase().split(' ')
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase()
        }
        return splitStr.join('')
    }

    return (
        <span>
            {showTextInMediaItems
                ? item.text.split(/\r?\n/).map((line: string, index: number) => <p key={index}>{line}</p>)
                : getShortCodeForItemLabel(item.text)}
        </span>
    )
}

export default MediaItemLabel
